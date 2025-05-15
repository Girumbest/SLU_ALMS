import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */

// };

// export default nextConfig;

 
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: [
        'musical-xylophone-jpxv56rqgxxf49p-3000.app.github.dev',
        'localhost:3000'
      ],
    },
  },
}
export default nextConfig;