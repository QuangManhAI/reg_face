import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",          // FE gọi /api/... 
        destination: "http://localhost:3001/:path*", // BE thật sự
      },
    ];
  },
};

export default nextConfig;
