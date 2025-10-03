"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";


export default function FaceLoginPage() {
    const refVideo = useRef<HTMLVideoElement | null> (null);
    const refCanvas = useRef<HTMLCanvasElement| null> (null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
            if (refVideo.current) refVideo.current.srcObject = stream;
        }).catch(err => {
            console.error('camera error:', err);
            setMsg("Cant open camera");
        });
    }, []);

    const loadModels = async() => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models/tiny_face_detector");
    };
    loadModels();

    const handleFaceLogin = async() => {
        if (!refVideo.current || !refCanvas.current) return;

        setLoading(true);
        setMsg("Collecting 5 frame");

        const frames: string[] = [];

        for (let i = 0; i < 5; i++) {
            const ctx = refCanvas.current.getContext("2d");
            if (!ctx) continue;
            ctx.drawImage(refVideo.current, 0, 0, 320, 240);

            const detections = await faceapi.detectSingleFace(
              refCanvas.current, 
              new faceapi.TinyFaceDetectorOptions()
            );
            if (!detections) {
              setMsg("Không phát hiện gương mặt, vui lòng thử lại!");
              break;
            }

            const dataUrl = refCanvas.current.toDataURL("image/jpeg");
            frames.push(dataUrl);
            await new Promise(res => setTimeout(res, 500));
        }

        if (frames.length < 5) {
            setMsg("Không đủ ảnh hợp lệ. Vui lòng thử lại!");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("/api/faces/verify-login", {
                frames,
            }, {
                headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`,}
            });

            if (res.data.success) {
                setMsg("Xác thực thành công đang chuyển hướng");
                router.push("/home");
            } else {
                setMsg(res.data.msg);
            }
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message
            setMsg(errorMsg);
        } finally {
            setLoading(false);
        }
    };

return (
<div className="relative flex flex-col items-center justify-center min-h-screen 
                bg-gradient-to-r from-pink-400 via-pink-500 to-orange-400">

  {/* Card */}
  <div className="bg-white/90 backdrop-blur-md rounded-2xl 
                  shadow-[0_8px_32px_rgba(0,0,0,0.3)] 
                  p-10 w-[520px] border border-yellow-200 text-center">

    <h2 className="text-3xl font-extrabold mb-6 text-gray-900">
      Xác thực gương mặt
    </h2>

    {/* Video */}
    <video
      ref={refVideo}
      autoPlay
      playsInline
      width="480"
      height="360"
      className="border-4 border-orange-400 rounded-2xl mx-auto mb-6 
                 shadow-[0_0_25px_rgba(251,191,36,0.6)]"
    />
    <canvas
      ref={refCanvas}
      width="480"
      height="360"
      style={{ display: "none" }}
    />

    {/* Hint */}
    <p className="text-gray-600 text-sm mb-6">
      Giữ khuôn mặt trong khung để xác thực
    </p>

    {/* Button */}
    <button
      onClick={handleFaceLogin}
      disabled={loading}
      className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2
        ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 hover:scale-105 transition-transform shadow-[0_4px_20px_rgba(251,191,36,0.8)]"
        }`}
    >
      {loading ? "Đang xác thực..." : "Xác thực"}
    </button>

    {/* Message */}
    <p className="mt-6 text-gray-700 text-base">{msg}</p>
  </div>
</div>
);


}