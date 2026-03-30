/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "export",
  assetPrefix: ".",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
