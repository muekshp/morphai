import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/services.html', destination: '/services', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/book-a-discovery-call.html', destination: '/book-a-discovery-call', permanent: true },
    ];
  },
};

export default nextConfig;
