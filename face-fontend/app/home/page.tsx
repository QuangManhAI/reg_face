"use client";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen 
                    bg-gradient-to-r from-pink-400 via-pink-500 to-orange-400">
      {/* Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl 
                      shadow-[0_8px_32px_rgba(0,0,0,0.3)] 
                      p-10 w-[600px] border border-yellow-200 text-center">
        
        {/* Tiêu đề */}
        <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
          🎉 Chào mừng!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-700 text-lg mb-8">
          Đây là trang chính của dự án <span className="font-bold text-orange-500">Xác thực gương mặt</span>.  
          Nhanh chóng, an toàn và dễ sử dụng ✨
        </p>

        {/* Thông tin về dự án */}
        <div className="text-left bg-white/80 rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">📌 Về dự án</h2>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
            <li>Đăng ký bằng email, mật khẩu và gương mặt.</li>
            <li>Đăng nhập chỉ bằng gương mặt qua webcam.</li>
            <li>Xây dựng đơn giản</li>
            <li>Ứng dụng xây dựng bằng <span className="font-semibold">Next.js</span>, <span className="font-semibold">NestJS</span> và <span className="font-semibold">FastAPI ML</span>.</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-sm">
          🚀 Dự án demo – dành cho thử nghiệm và học tập.
        </p>
      </div>
    </div>
  );
}
