import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
    {
      name: "client",
      type: "spa",
      handler: "./index.ts",
      target: "browser",
      plugins: () => [reactRefresh()],
    },
    {
      name: "api",
      type: "http",
      base: "/api",
      handler: "./api/index.ts",
    },
  ],
});
