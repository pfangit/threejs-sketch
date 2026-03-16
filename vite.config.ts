import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import externalGlobals from "rollup-plugin-external-globals";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfigExport } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteMockServe } from "vite-plugin-mock";
import proxy from "./config/proxy";
import { settings } from "./config/settings.ts";

const port = parseInt(process.env.PORT || "1420", 10);
const appEnv = process.env.NODE_ENV || "dev";
const mock = process.env.VITE_USE_MOCK !== "false";

console.log(
  "----------------- app env ---------- ",
  appEnv,
  mock ? "mock" : "no mock",
);

// https://vite.dev/config/
export default (): UserConfigExport => {
  return defineConfig({
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: "[ext]/[name]-[hash].[ext]",
        },
        plugins: [
          externalGlobals({
            // react: "React",
            // "react-dom": "ReactDOM",
            // "react-router": "ReactRouter",
            // "react-router-dom": "ReactRouterDOM",
          }),
        ],
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      viteMockServe({
        mockPath: "mock",
        cors: true,
        logger: true,
        enable: mock,
        watchFiles: true, // 监听mock文件变化
      }),
      createHtmlPlugin({
        inject: {
          data: {
            // 定义了一个title 变量，可以被html中进行引用
            title: settings.appName,
          },
        },
      }),
      visualizer({
        gzipSize: true,
        brotliSize: true,
        emitFile: false,
        open: true, //如果存在本地服务端口，将在打包后自动展示
      }),
    ],
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: port || 5173,
      strictPort: true,
      open: true,
      proxy: proxy[appEnv as keyof typeof proxy],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, ".", "src"),
        // 强制主项目和链接包使用同一个 React 实例，否则容易造成useState null问题
        react: resolve(__dirname, "./node_modules/react"),
        "react-dom": resolve(__dirname, "./node_modules/react-dom"),
      },
    },
    base: settings.path,
  });
};
