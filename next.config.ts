import type { NextConfig } from "next";

// No GitHub Pages o site vive em https://<usuario>.github.io/excursao-kairos,
// então o workflow define GITHUB_PAGES=true para prefixar todos os caminhos.
const basePath = process.env.GITHUB_PAGES === "true" ? "/excursao-kairos" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
