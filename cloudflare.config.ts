import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "gaas",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-18",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({
        name: "gaas-production",
        id: "48b09f17-fa3f-42b2-9d34-a268d63a186f",
      }),
      BETTER_AUTH_URL: bindings.text("https://gaas.taku-takahashi120.workers.dev"),
      BETTER_AUTH_SECRET: bindings.secret(),
      VINEXT_KV_CACHE: bindings.kv({ id: "4b6e0b60f1da4a6b884d9cd958b93191" }),
    },
  }),
});
