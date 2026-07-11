/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fresh build dir override for local verification only; defaults to .next.
  distDir: process.env.NEXT_DIST || ".next",
};

export default nextConfig;
