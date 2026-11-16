import { pbkdf2Sync } from "node:crypto";
import type { NextConfig } from "next";

// No GitHub Pages o site vive em https://<usuario>.github.io/excursao-kairos,
// então o workflow define GITHUB_PAGES=true para prefixar todos os caminhos.
const basePath = process.env.GITHUB_PAGES === "true" ? "/excursao-kairos" : "";

// Painel admin: ADMIN_LOGIN e ADMIN_PASSWORD vêm de secrets (GitHub Actions)
// ou do .env.local. Só um hash derivado deles vai para o site; a senha nunca.
// Os parâmetros precisam bater com lib/admin/crypto.ts.
function adminVerifier() {
  const login = process.env.ADMIN_LOGIN?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!login || !password) return "";
  return pbkdf2Sync(
    `${login}\n${password}`,
    "kairos-admin-verifier-v1",
    150_000,
    32,
    "sha256",
  ).toString("hex");
}

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_ADMIN_VERIFIER: adminVerifier(),
  },
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
