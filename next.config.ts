import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mtpbojzgosselxjomkek.supabase.co", // <-- your Supabase project ref
        pathname: "/storage/v1/object/public/**", // allow all public bucket images
      },
    ],
  },
};

export default nextConfig;
