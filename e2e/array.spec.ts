import { expect, test, type Page } from "@playwright/test";

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function next(page: Page, times: number) {
  for (let step = 0; step < times; step += 1) {
    await page.getByRole("button", { name: "Langkah berikutnya" }).click();
  }
}

async function answerArrayQuiz(page: Page) {
  for (let question = 1; question <= 10; question += 1) {
    await expect(page.getByText(`Pertanyaan ${question} dari 10`)).toBeVisible();
    await page.getByRole("radio").first().check();
    await page
      .getByRole("button", { name: question === 10 ? "Submit quiz" : "Berikutnya" })
      .click();
  }
}

test("runs all Array operations with shifting, memory, and synchronized code", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  const response = await page.goto("/visualizer/array");
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { name: "Array Visualizer" })).toBeVisible();
  await expect(page.locator('[data-array-index="0"][data-array-value="10"]')).toBeVisible();
  await expect(page.locator('[data-array-index="3"][data-array-value="40"]')).toBeVisible();

  await page.getByRole("button", { name: "Access", exact: true }).click();
  await next(page, 2);
  await expect(page.getByRole("heading", { name: "Nilai ditemukan" })).toBeVisible();
  await expect(page.getByText(/arr\[1\] adalah 20/)).toBeVisible();

  await page.getByLabel("Nilai (-99 sampai 999)").fill("99");
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await next(page, 2);
  await expect(page.locator('[data-array-index="1"][data-array-value="99"]')).toBeVisible();

  await page.getByLabel("Index (mulai dari 0)").fill("1");
  await page.getByLabel("Nilai (-99 sampai 999)").fill("15");
  await page.getByRole("button", { name: "Insert", exact: true }).click();
  await next(page, 2);
  await expect(page.getByRole("heading", { name: "Geser index 3 ke 4" })).toBeVisible();
  await expect(page.locator('[data-empty-index="3"]')).toBeVisible();
  await expect(page.locator('[data-active="true"]')).toContainText(/arr\[i\]|UNTUK i/);
  await next(page, 4);
  await expect(page.locator('[data-array-index="1"][data-array-value="15"]')).toBeVisible();
  await expect(page.locator('[data-array-index="2"][data-array-value="99"]')).toBeVisible();

  await page.getByLabel("Index (mulai dari 0)").fill("2");
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await next(page, 4);
  await expect(page.locator('[data-array-index="0"][data-array-value="10"]')).toBeVisible();
  await expect(page.locator('[data-array-index="1"][data-array-value="15"]')).toBeVisible();
  await expect(page.locator('[data-array-index="2"][data-array-value="30"]')).toBeVisible();

  await page.getByRole("button", { name: "Memori" }).click();
  await expect(page.getByText("0xB100", { exact: true })).toBeVisible();
  await expect(page.getByText("0xB104", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Traversal", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Mulai traversal" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("opens the Array curriculum and completes the shared quiz as guest", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.goto("/learn/array");
  await expect(page.getByRole("heading", { name: "Array", level: 1 })).toBeVisible();
  await expect(page.getByText("Kurikulum — 12 lesson")).toBeVisible();
  await page.getByRole("link", { name: "Mulai quiz" }).click();
  await expect(page).toHaveURL(/\/learn\/array\/quiz$/);
  await expect(page.getByText("Pertanyaan 1 dari 10")).toBeVisible();
  const publicPage = await page.request.get("/learn/array/quiz");
  const serialized = await publicPage.text();
  expect(serialized).not.toContain("correctOptionId");
  expect(serialized).not.toContain("Array zero-based menempatkan elemen pertama pada index 0");
  await answerArrayQuiz(page);
  await expect(page.getByText("Hasil quiz", { exact: true })).toBeVisible();
  await expect(page.getByText(/tidak disimpan.*guest/)).toBeVisible();
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.getByText("Pertanyaan 1 dari 10")).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("keeps Array visualizer, curriculum, and quiz usable at 390 by 844", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/visualizer/array", "/learn/array", "/learn/array/quiz"]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(page.getByText("Pertanyaan 1 dari 10")).toBeVisible();
  await answerArrayQuiz(page);
  await expect(page.getByText("Hasil quiz", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(browserErrors).toEqual([]);
});
