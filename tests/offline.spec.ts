import { expect, test } from "@playwright/test";
import { readdir } from "node:fs/promises";

test("cold offline launch preserves daters and supports note CRUD", async ({ page, context, browserName }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("create your first dater")).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
    }
  });
  // All exported files are cached, not just assets requested on the first screen.
  const cached = await page.evaluate(async () => {
    const name = (await caches.keys()).find((key) => key.startsWith("dater-shell-"))!;
    return (await (await caches.open(name)).keys()).map((request) => new URL(request.url).pathname);
  });
  async function files(dir: string, prefix = ""): Promise<string[]> {
    const result: string[] = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${prefix}/${entry.name}`;
      result.push(...(entry.isDirectory() ? await files(`${dir}/${entry.name}`, path) : [path]));
    }
    return result;
  }
  expect(cached.sort()).toEqual((await files(`${__dirname}/../out`)).filter((path) => path !== "/sw.js").sort());
  expect(cached.some((path) => path.endsWith(".woff2"))).toBe(true);
  // Seed existing data through the actual app UI before leaving the network.
  await page.locator("header button").click();
  await page.getByPlaceholder("e.g. summer break, subscription...").fill("offline dater");
  await page.getByRole("button", { name: "anchor day", exact: true }).click();
  await page.getByRole("button", { name: "create dater", exact: true }).click();
  await expect(page.locator("select")).toHaveValue(/.+/);
  // Disable HTTP cache too: the service worker alone must provide the shell.
  if (browserName === "chromium") {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  }
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("select")).toContainText("offline dater");
  await page.getByPlaceholder("add a note...").fill("written without a network");
  await page.getByPlaceholder("add a note...").press("Enter");
  await expect(page.getByText("written without a network", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("offline-mobile.png"), fullPage: true });
  await page.close();
  const fresh = await context.newPage();
  fresh.on("pageerror", (error) => errors.push(error.message));
  await fresh.goto("/?launch=offline");
  await expect(fresh.locator("select")).toContainText("offline dater");
  await expect(fresh.getByText("written without a network", { exact: true })).toBeVisible();
  // Create another dater and delete it, still offline.
  await fresh.locator("header button").click();
  await fresh.getByPlaceholder("e.g. summer break, subscription...").fill("created offline");
  await fresh.getByRole("button", { name: "anchor day", exact: true }).click();
  await fresh.getByRole("button", { name: "create dater", exact: true }).click();
  await expect(fresh.locator("select option:checked")).toHaveText("created offline");
  await fresh.getByRole("button", { name: "delete dater", exact: true }).click();
  await fresh.locator("div.fixed button").first().click();
  await expect(fresh.locator("select")).not.toContainText("created offline");
  await fresh.reload();
  await expect(fresh.getByText("written without a network", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
