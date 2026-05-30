/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'theme.hstatic.net',  pathname: '/**' },
      { protocol: 'https', hostname: 'product.hstatic.net', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.hstatic.net',     pathname: '/**' },
    ],
  },

  // Allow WASM + CDN scripts required by MediaPipe FaceMesh
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ]
  },

  webpack: (config, { isServer }) => {
    // Server: never bundle MediaPipe (browser-only)
    if (isServer) {
      config.externals = [...(config.externals ?? []), '@mediapipe/face_mesh']
    }

    // Client: treat .wasm files as static assets (do not bundle them)
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    })

    return config
  },
}

module.exports = nextConfig
