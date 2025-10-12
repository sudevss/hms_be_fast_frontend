/* eslint-disable no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
// Alias needs to be added/removed in jsconfig.json and .eslintrc files for path intellisence and prevent eslint path unresolved errors
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // console.log(env);
  console.log(mode);
  const javaBackendURL = env.VITE_API_BASE_URL;

  const expressBackendURL =
    mode === "test"
      ? `${env.VITE_API_BASE_URL.split(":")[0]}:8080`
      : "http://localhost:8080";

  const timestamp = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "full",
    hour12: false,
  }).format(new Date());

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
    ],
    server: {
      host: true,
      port: 5178,
      strictPort: true,
      proxy: {
        "/api": {
          target: javaBackendURL,
          changeOrigin: true,
          secure: false,
        },
        "/v2/api": {
          target: expressBackendURL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      sourcemap: true,
      outDir: "server/client",
    },
    resolve: {
      alias,
    },
    define: {
      // APP_VERSION: JSON.stringify("v1.0.0"),
      "import.meta.env.APP_VERSION": "2.5",
      "import.meta.env.APP_BUILD_TIMESTAMP": JSON.stringify(timestamp),
    },
    optimizeDeps: {
      include: ["@emotion/react", "@emotion/styled", "@mui/material/Tooltip"],
    },
  };
});

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
