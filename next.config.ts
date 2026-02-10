import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 정적 사이트로 내보내기
  images: {
    unoptimized: true, // Cloudflare Pages에서 이미지 최적화 비활성화
  },
};

export default nextConfig;
