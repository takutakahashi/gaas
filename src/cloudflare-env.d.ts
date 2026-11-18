declare module "cloudflare:workers" {
  export const env: {
    DB: D1Database;
    BETTER_AUTH_URL: string;
    BETTER_AUTH_SECRET: string;
    ASSETS: Fetcher;
    VINEXT_KV_CACHE: KVNamespace;
  };
}
