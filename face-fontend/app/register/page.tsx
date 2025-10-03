"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";

export default function RegisterFacePage() {
  const refVideo = useRef<HTMLVideoElement | null>(null);
  const refCanvas = useRef<HTMLCanvasElement | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (refVideo.current) {
          refVideo.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Webcam error:", err));
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68");
    };
    loadModels();
  }, []);

  const handleRegister = async () => {
    if (!refVideo.current || !refCanvas.current) return;

    setIsCapturing(true);
    setMessage("Đang chụp 5 khung hình...");

    const collectionFrames: Blob[] = [];

    for (let i = 0; i < 5; i++) {
      const ctx = refCanvas.current.getContext("2d");
      if (!ctx) continue;

      const vw = refVideo.current.videoWidth;
      const vh = refVideo.current.videoHeight;

      refCanvas.current.width = vw;
      refCanvas.current.height = vh;
      ctx.drawImage(refVideo.current, 0, 0, vw, vh);

      const detections = await faceapi.detectSingleFace(refCanvas.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

      if (detections) {
          const dims = { width: refCanvas.current.width, height: refCanvas.current.height };
          const resized = faceapi.resizeResults(detections, dims);
          new faceapi.draw.DrawFaceLandmarks(resized.landmarks).draw(refCanvas.current!);
      } else {
        setMessage("Không phát hiện gương mặt, hãy đưa mặt vào khung!");
        break;
      }
      const blob: Blob | null = await new Promise((resolve) =>
        refCanvas.current?.toBlob(resolve, "image/jpeg")
      );
      if (blob) collectionFrames.push(blob);
      await new Promise((res) => setTimeout(res, 500));
    }

    if (collectionFrames.length < 5) {
      setMessage("Không đủ ảnh hợp lệ (có khuôn mặt). Vui lòng thử lại!");
      setIsCapturing(false);
      return;
    }

    const formData = new FormData();
    collectionFrames.forEach((frame, i) => {
      formData.append("files", frame, `frame_${i}.jpg`);
    });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/faces/register`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      router.push(`/face-login`);
      setMessage(`Đăng ký gương mặt thành công`);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message
      setMessage(errorMsg);
    } finally {
      setIsCapturing(false);
    }
  };

return (
<div className="relative flex flex-col items-center justify-center min-h-screen 
                bg-gradient-to-r from-pink-400 via-pink-500 to-orange-400">
  
  {/* Card */}
  <div className="bg-white/90 backdrop-blur-md rounded-2xl 
                  shadow-[0_8px_32px_rgba(0,0,0,0.3)] 
                  p-10 w-[520px] border border-yellow-200 text-center">
    
    <h2 className="text-3xl font-extrabold mb-4 text-gray-900">
      Đăng ký gương mặt
    </h2>
    <p className="mb-6 text-gray-600 text-sm">
      Giữ khuôn mặt trong khung để hệ thống chụp 5 ảnh liên tiếp
    </p>

    {/* Camera */}
    <video
      ref={refVideo}
      autoPlay
      playsInline
      width="480"
      height="360"
      className="border-4 border-orange-400 rounded-2xl mx-auto mb-6 
                 shadow-[0_0_25px_rgba(251,191,36,0.6)]"
    />
    <canvas ref={refCanvas} width="480" height="360" style={{ display: "none" }} />

    {/* Button */}
    <button
      onClick={handleRegister}
      disabled={isCapturing}
      className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2
        ${isCapturing
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 hover:scale-105 transition-transform shadow-[0_4px_20px_rgba(251,191,36,0.8)]"
        }`}
    >
      {isCapturing ? "Đang đăng ký..." : "Đăng ký gương mặt"}
    </button>

    {/* Message */}
    <p className="mt-6 text-gray-700 text-base">{message}</p>
  </div>
</div>

);

}
