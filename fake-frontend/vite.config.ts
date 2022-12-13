import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // "/tokenGenerate": {
      //   target: "http://localhost:3001",
      //   changeOrigin: true,
      //   secure: false,
      //   ws: true,
      //   configure: (proxy, _options) => {
      //     proxy.on("error", (err, _req, _res) => {
      //       console.log("proxy error", err);
      //     });
      //     proxy.on("proxyReq", (proxyReq, req, _res) => {
      //       console.log("Sending Request to the Target:", req.method, req.url);
      //     });
      //     proxy.on("proxyRes", (proxyRes, req, _res) => {
      //       console.log(
      //         "Received Response from the Target:",
      //         proxyRes.statusCode,
      //         req.url
      //       );
      //     });
      //   },
      // },
    },
  },
  plugins: [react()],
});
