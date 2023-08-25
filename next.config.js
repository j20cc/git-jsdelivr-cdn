/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
        port: '',
      },
    ],
  },
}

module.exports = nextConfig
