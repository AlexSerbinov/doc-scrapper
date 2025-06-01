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
    // Public variables (available in browser)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_RAG_API_URL: process.env.NEXT_PUBLIC_RAG_API_URL,
    
    // Server-only variables (for API routes)
    RAG_SERVER_URL: process.env.RAG_SERVER_URL,
    INTERNAL_RAG_API_URL: process.env.INTERNAL_RAG_API_URL,
    INTERNAL_SCRAPER_PATH: process.env.INTERNAL_SCRAPER_PATH,
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
