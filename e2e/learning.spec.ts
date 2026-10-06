import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function answerFromQuestionThree(page: Page) {
  for (let question = 3; question <= 10; question += 1) {
    await expect(page.getByText(`Pertanyaan ${question} dari 10`)).toBeVisible();
    await page.getByRole("radio").first().check();
    await page
      .getByRole("button", { name: question === 10 ? "Submit quiz" : "Berikutnya" })
      .click();
  }
}

test("guest completes the Linked List quiz without solution leakage or persistence", async ({
  page,
}) => {
  const browserErrors = collectBrowserErrors(page);
  const moduleResponse = await page.goto("/learn/linked-list");
  expect(moduleResponse?.ok()).toBe(true);
  await expect(page.getByRole("heading", { name: "Linked List", level: 1 })).toBeVisible();
  await expect(page.getByText("Kurikulum — 18 lesson")).toBeVisible();
  await Promise.all([
    page.waitForURL("**/learn/linked-list/quiz", { timeout: 20_000 }),
    page.getByRole("link", { name: "Mulai quiz" }).click(),
  ]);

  await expect(page.getByText("Pertanyaan 1 dari 10")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Node menyimpan data dan pointer next", { exact: false })).toHaveCount(0);
  const initialMarkup = await page.locator("body").innerText();
  expect(initialMarkup).not.toContain("Jawaban benar:");

  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Berikutnya" }).click();
  const secondAnswer = page.getByRole("radio").first();
  await secondAnswer.check();
  await page.getByRole("button", { name: "Berikutnya" }).click();
  await page.getByRole("button", { name: "Sebelumnya" }).click();
  await expect(page.getByRole("radio").first()).toBeChecked();
  await page.getByRole("button", { name: "Berikutnya" }).click();
  await answerFromQuestionThree(page);

  await expect(page.getByText("Hasil quiz", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText(/tidak disimpan.*guest/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ringkasan topik" })).toBeVisible();
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.getByText("Pertanyaan 1 dari 10")).toBeVisible();
  await expect(page.getByRole("radio").first()).not.toBeChecked();

  const pageData = await page.request.get("/learn/linked-list/quiz");
  const serialized = await pageData.text();
  expect(serialized).not.toContain("correctOptionId");
  expect(serialized).not.toContain("Node menyimpan data dan pointer next yang menghubungkannya");

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Belajar sebagai guest" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/tidak disimpan/)).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("module and quiz remain usable at 390 by 844", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/linked-list");
  await expect(page.getByRole("heading", { name: "Linked List", level: 1 })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await Promise.all([
    page.waitForURL("**/learn/linked-list/quiz", { timeout: 20_000 }),
    page.getByRole("link", { name: "Mulai quiz" }).click(),
  ]);

  for (let question = 1; question <= 10; question += 1) {
    await page.getByRole("radio").first().check();
    await page
      .getByRole("button", { name: question === 10 ? "Submit quiz" : "Berikutnya" })
      .click();
  }
  await expect(page.getByText("Hasil quiz", { exact: true })).toBeVisible({
    timeout: 20_000,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  expect(browserErrors).toEqual([]);
});
