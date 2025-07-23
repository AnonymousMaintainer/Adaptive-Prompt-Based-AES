import type { NextConfig } from "next";

require("dotenv").config();

const nextConfig: NextConfig = {
  output: 'standalone', // Important for Docker builds
  reactStrictMode: true,
  env: {
    BASE_BACKEND_URL: process.env.BASE_BACKEND_URL,
  },
  images: {
    domains: ['culi-dev-s3.s3.amazonaws.com'],
  },
};

export default nextConfig;
