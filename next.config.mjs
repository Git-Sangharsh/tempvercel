/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    // Change below URL with your current domain
    API_PROD_URL: "https://tempvercel-delta.vercel.app/api",
    storageURL: "https://tempvercel-delta.vercel.app/",
  },

  images: {
    // Adding domains for external images
    domains: ["tempvercel-delta.vercel.app"],

    // Adding remote patterns for image optimization
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tempvercel-delta.vercel.app",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  module: {
    rules: [
      { test: /\.(ts|tsx|jsx)$/, loader: "ts-loader" },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(gif|svg|jpg|png|mp3)$/,
        use: ["file-loader"],
      },
    ],
    plugins: {
      autoprefixer: {},
    },
  },
  // other boilerplate config goes down here
};

export default nextConfig;
