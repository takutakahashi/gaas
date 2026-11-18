import { chromium } from "playwright";

const baseURL = process.env.SMOKE_BASE_URL;
if (!baseURL) throw new Error("SMOKE_BASE_URL is required");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ baseURL });
const page = await context.newPage();
let registrationContext;
page.on("response", async (response) => {
  if (response.url().endsWith("/api/registration-context") && response.ok()) {
    registrationContext = (await response.json()).context;
  }
});
const cdp = await context.newCDPSession(page);
await cdp.send("WebAuthn.enable");
await cdp.send("WebAuthn.addVirtualAuthenticator", {
  options: {
    protocol: "ctap2",
    transport: "internal",
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
    automaticPresenceSimulation: true,
  },
});

try {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByLabel("表示名").fill("本番動作確認");
  await page.getByRole("button", { name: "Passkey を登録して始める" }).click();
  await page.waitForURL("**/projects", { timeout: 20_000 });

  if (!registrationContext) throw new Error("registration context was not captured");
  const unauthenticated = await browser.newContext({ baseURL });
  const replay = await unauthenticated.request.get("/api/auth/passkey/generate-register-options", {
    params: { context: registrationContext },
  });
  if (replay.status() !== 400) throw new Error(`consumed registration context was accepted: ${replay.status()}`);
  const forged = await unauthenticated.request.get("/api/auth/passkey/generate-register-options", {
    params: { context: JSON.stringify({ id: "00000000-0000-7000-8000-000000000001", name: "attacker" }) },
  });
  if (forged.status() !== 400) throw new Error(`forged registration context was accepted: ${forged.status()}`);
  await unauthenticated.close();

  await page.getByLabel("帳簿名").fill("本番スモークテスト");
  await page.getByRole("button", { name: "帳簿を作成" }).click();
  await page.waitForURL(/\/projects\/[0-9a-f-]+$/, { timeout: 20_000 });
  await page.getByRole("link", { name: "物品を登録", exact: true }).click();

  await page.getByLabel("名称").fill("検証用ノートPC");
  await page.getByLabel("種別").fill("コンピューター");
  await page.getByLabel("価格（税込・円）").fill("120000");
  await page.getByLabel("償却開始月").fill("2026-11");
  await page.getByLabel("耐用月数").fill("12");
  await page.getByRole("button", { name: "登録する" }).click();
  await page.waitForURL(/\/projects\/[0-9a-f-]+$/, { timeout: 20_000 });

  await page.getByText("検証用ノートPC").waitFor();
  await page.locator(".monthly-value").filter({ hasText: "￥10,000" }).waitFor();
  const heading = await page.getByRole("heading", { name: "本番スモークテスト" }).textContent();
  console.log(JSON.stringify({ ok: true, heading, url: page.url() }));
} finally {
  await browser.close();
}
