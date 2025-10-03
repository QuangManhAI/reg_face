"use client"
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]         = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/users/register", {
        fullName,
        email,
        password,
      });
      setMsg("Đăng kí thành công");
      router.push(`/login`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message
      console.error(err);
      setMsg(errorMsg);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen 
                    bg-gradient-to-r from-pink-400 via-pink-500 to-orange-400">
      {/* Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl 
                      shadow-[0_8px_32px_rgba(0,0,0,0.3)] 
                      p-10 w-[420px] border border-yellow-200">

        <h2 className="text-3xl font-extrabold mb-2 text-gray-900">
          Đăng ký tài khoản
        </h2>
        <p className="mb-8 text-gray-600 text-sm">
          Nhanh chóng & an toàn 
        </p>

        {/* Input họ tên */}
        <div className="flex items-center mb-4 p-4 w-full rounded-xl bg-white 
                        border border-gray-300 focus-within:ring-2 focus-within:ring-orange-400">
          <span className="mr-3 text-orange-500"></span>
          <input
            type="text"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Input email */}
        <div className="flex items-center mb-4 p-4 w-full rounded-xl bg-white 
                        border border-gray-300 focus-within:ring-2 focus-within:ring-orange-400">
          <span className="mr-3 text-orange-500"></span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Input password */}
        <div className="flex items-center mb-6 p-4 w-full rounded-xl bg-white 
                        border border-gray-300 focus-within:ring-2 focus-within:ring-orange-400">
          <span className="mr-3 text-orange-500"></span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 text-lg rounded-xl font-bold text-white flex items-center justify-center gap-2
                     bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 
                     hover:scale-105 transition-transform 
                     shadow-[0_4px_20px_rgba(251,191,36,0.8)]"
        >
          Đăng ký
        </button>

        {/* Message */}
        <p className="mt-6 text-gray-700 text-sm">{msg}</p>

        {/* Footer */}
        <p className="mt-4 text-gray-700 text-sm">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-orange-600 font-semibold hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );

}
