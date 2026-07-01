import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit loads .afm font metrics from disk — must not be webpack-bundled
  serverExternalPackages: ["pdfkit", "@anthropic-ai/sdk"],
};

export default nextConfig;
