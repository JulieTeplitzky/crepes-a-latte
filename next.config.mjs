/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allows a fresh build dir during local verification; defaults to .next.
  distDir: process.env.NEXT_DIST || ".next",
};

export default nextConfig;
