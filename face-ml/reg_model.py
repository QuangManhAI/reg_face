import numpy as np
import torch 
import cv2
from fastapi import FastAPI, UploadFile, File
from facenet_pytorch import InceptionResnetV1, MTCNN
torch.backends.cudnn.enabled = False
from PIL import Image
import uvicorn
from typing import List 
from fastapi import Form
import os
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = os.getenv("BASE_DIR", ".")
ML_PORT = int(os.getenv("ML_PORT", "9100"))


device = "cuda" if torch.cuda.is_available()  else "cpu"
print("Device: ", device)


mtcnn = MTCNN(image_size=160, margin=0, min_face_size=40, device=device)
resnet = InceptionResnetV1(pretrained="vggface2").eval().to(device)

app = FastAPI(title="Face Recognition")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # FE Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sim_to_conf(sim: float, alpha: float = 10, beta: float = 0.7):
    return 1 / (1 + np.exp(-alpha * (sim - beta)))

@app.post("/extract_batch")
async def extract_batch(ref_path: str = Form(...), files: List[UploadFile] = File(...)):

    abs_ref_path = os.path.join(BASE_DIR, ref_path.lstrip("./"))
    if not os.path.exists(abs_ref_path):
        return {"status": "error", "msg": f"Ref file not found: {abs_ref_path}"}
    ref_img = Image.open(abs_ref_path).convert("RGB")
    ref_face = mtcnn(ref_img)
    if ref_face is None:
        return {"status": "error", "msg": "No face in reference image"}
    ref_emb = resnet(ref_face.unsqueeze(0).to(device)).detach().cpu().numpy()[0]
    ref_norm = ref_emb / np.linalg.norm(ref_emb)

    embeddings = []
    for file in files:
        img_bytes = await file.read()
        img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        face = mtcnn(img_pil)
        if face is None:
            continue
        emb = resnet(face.unsqueeze(0).to(device)).detach().cpu().numpy()[0]
        embeddings.append(emb)

    if len(embeddings) == 0:
        return {"status": "error", "msg": "No valid faces in frames"}
    mean_emb = np.mean(embeddings, axis=0)
    mean_emb = mean_emb / np.linalg.norm(mean_emb)

    ref_norm = ref_emb / np.linalg.norm(ref_emb)
    sim = np.dot(ref_norm, mean_emb)
    conf = float(sim_to_conf(sim))
    print(f"Frames used={len(embeddings)}, similarity={sim:.4f}, confidence={conf:.4f}")
    return {"status": "ok", "frames_used": len(embeddings), "similarity": float(sim), "confidence": float(conf)}

@app.post("/select_best_frame")
async def select_best_frame(files: List[UploadFile] = File(...)):
    best_prob = -1
    best_idx = -1
    for i, file in enumerate(files):
        img_bytes = await file.read()
        img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

        face, prob = mtcnn(img_pil, return_prob=True)
        if face is None:
            continue
        if prob > best_prob:
            best_prob = prob
            best_idx = i
    if best_idx == -1:
        return {"status": "error", "msg": "No valid faces"}
    return {"status": "ok", "index": best_idx, "confidence": float(best_prob)}


if __name__ == "__main__":
    uvicorn.run("reg_model:app", host="0.0.0.0", port=ML_PORT) 