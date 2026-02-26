import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.*', '172.20.10.*'],

  // Proxy all /api/v1/* requests to the NestJS backend.
  // This makes the browser talk to the same origin as the frontend,
  // so the HttpOnly 'rt' cookie is always sent (no cross-origin SameSite issues).
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
