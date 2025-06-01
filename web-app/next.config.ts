import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Optimize for production
  reactStrictMode: true,
  
  // Image optimization
  images: {
    unoptimized: true, // Disable optimization for static export if needed
  },
  
  // Environment variable configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_RAG_API_URL: process.env.NEXT_PUBLIC_RAG_API_URL,
  },
  
  // Server external packages for Docker support (Updated for Next.js 15)
  serverExternalPackages: ['sharp'],
  
  // Webpack configuration for Docker
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sharp');
    }
    return config;
  },
};

export default nextConfig;
