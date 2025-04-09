import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
    experimental: {
        reactCompiler: true
      }
};

export default withPayload(nextConfig);
