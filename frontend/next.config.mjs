/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images served from Google Cloud Storage buckets
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
