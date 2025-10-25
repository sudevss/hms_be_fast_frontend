/* eslint-disable no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

const alias = [
  {
    find: "@",
    replacement: path.resolve(__dirname, "./src"),
  },
  {
    find: "@components",
    replacement: path.resolve(__dirname, "./src/components"),
  },
  {
    find: "@contexts",
    replacement: path.resolve(__dirname, "./src/contexts"),
  },
  {
    find: "@data",
    replacement: path.resolve(__dirname, "./src/data"),
  },
  {
    find: "@features",
    replacement: path.resolve(__dirname, "./src/features"),
  },
  {
    find: "@pages",
    replacement: path.resolve(__dirname, "./src/pages"),
  },
  {
    find: "@utils",
    replacement: path.resolve(__dirname, "./src/utils"),
  },
  {
    find: "@assets",
    replacement: path.resolve(__dirname, "./src/assets"),
  },
  {
    find: "@hooks",
    replacement: path.resolve(__dirname, "./src/hooks"),
  },
  {
    find: "@stores",
    replacement: path.resolve(__dirname, "./src/stores"),
  },
  {
    find: "@",
    replacement: path.resolve(__dirname, "./src"),
  },
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const javaBackendURL = env.VITE_API_BASE_URL;

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: { plugins: ["@emotion/babel-plugin"] },
      }),
    ],
    build: {
      sourcemap: true,
      outDir: "server/client",
      rollupOptions: {
        onwarn(warning, warn) {
          // Ignore "use client" warnings
          if (
            warning.message.includes('"use client"') ||
            warning.message.includes("Module level directives cause errors")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
    resolve: { alias },
    define: {
      "import.meta.env.APP_VERSION": "2.5",
      "import.meta.env.APP_BUILD_TIMESTAMP": JSON.stringify(
        new Date().toISOString()
      ),
    },
  };
});
