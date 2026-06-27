/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Optimize local images. Remote images (blog covers / gallery media that
    // may live on a VPS) are allowed through wildcard patterns so next/image
    // won't throw on unknown hosts.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
}

export default nextConfig
