/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "tesseract.js", "sharp"],
    outputFileTracingIncludes: {
      "/api/gerar-proposta": ["./node_modules/@sparticuz/chromium/bin/**/*"],
      "/api/extrair-documento": ["./tessdata/**/*"],
    },
  },
};

export default nextConfig;
