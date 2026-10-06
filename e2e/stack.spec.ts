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

async function completePush(page: Page, value: number, expectedTop: number) {
  await page.getByLabel("Nilai Push (-99 sampai 999)").fill(String(value));
  await page.getByRole("button", { name: "Push", exact: true }).click();
  await next(page, 3);
  await expect(page.locator(`[data-stack-value="${value}"][data-top="true"]`)).toBeVisible();
  await expect(page.getByTestId("top-index")).toHaveText(`TOP = ${expectedTop}`);
}

async function answerStackQuiz(page: Page) {
  for (let question = 1; question <= 10; question += 1) {
    await expect(page.getByText(`Pertanyaan ${question} dari 10`)).toBeVisible();
    await page.getByRole("radio").first().check();
    await page
      .getByRole("button", { name: question === 10 ? "Submit quiz" : "Berikutnya" })
      .click();
  }
}

test("runs Stack operations, trace transitions, boundaries, memory, and synchronized code", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  const response = await page.goto("/visualizer/stack");
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { name: "Stack Visualizer" })).toBeVisible();
  await expect(page.locator('[data-stack-value="30"][data-top="true"]')).toBeVisible();
  await expect(page.getByText("Ukuran 3 / Kapasitas 8")).toBeVisible();

  await page.getByRole("button", { name: "Push", exact: true }).click();
  await next(page, 1);
  await expect(page.getByRole("heading", { name: "Siapkan elemen" })).toBeVisible();
  await expect(page.getByText("Elemen transisi masuk")).toBeVisible();
  await expect(page.locator('[data-visual-state="new"]')).toBeVisible();
  await expect(page.locator('[data-active="true"]')).toContainText(/top = top \+ 1|TOP ← TOP \+ 1/);
  await next(page, 2);
  await expect(page.locator('[data-stack-value="40"][data-top="true"]')).toBeVisible();

  await page.getByRole("button", { name: "Pop", exact: true }).click();
  await next(page, 2);
  await expect(page.getByRole("heading", { name: "Lepaskan TOP" })).toBeVisible();
  await expect(page.getByText("Elemen transisi keluar")).toBeVisible();
  await expect(page.locator('[data-visual-state="removed"]')).toBeVisible();
  await next(page, 1);
  await expect(page.locator('[data-stack-value="30"][data-top="true"]')).toBeVisible();

  await page.getByRole("button", { name: "Peek", exact: true }).click();
  await next(page, 2);
  await expect(page.getByText(/Nilai TOP adalah 30/)).toBeVisible();
  await expect(page.locator('[data-stack-value="30"][data-top="true"]')).toBeVisible();

  await page.getByRole("button", { name: "Memori" }).click();
  await expect(page.getByText("0xC100", { exact: true })).toBeVisible();
  await expect(page.getByText("0xC108", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Reset 10,20,30" }).click();
  await completePush(page, 40, 3);
  await completePush(page, 50, 4);
  await completePush(page, 60, 5);
  await completePush(page, 70, 6);
  await completePush(page, 80, 7);
  await page.getByLabel("Nilai Push (-99 sampai 999)").fill("90");
  await page.getByRole("button", { name: "Push", exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("Stack penuh");

  await page.getByRole("button", { name: "Kosongkan" }).click();
  await expect(page.getByTestId("top-index")).toHaveText("TOP = -1");
  await page.getByRole("button", { name: "Pop", exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("Stack kosong");
  expect(browserErrors).toEqual([]);
});

test("opens Stack curriculum and completes the generic quiz as guest", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.goto("/learn/stack");
  await expect(page.getByRole("heading", { name: "Stack", level: 1 })).toBeVisible();
  await expect(page.getByText("Kurikulum — 11 lesson")).toBeVisible();
  await page.getByRole("link", { name: "Mulai quiz" }).click();
  await expect(page).toHaveURL(/\/learn\/stack\/quiz$/);
  const publicPage = await page.request.get("/learn/stack/quiz");
  const serialized = await publicPage.text();
  expect(serialized).not.toContain("correctOptionId");
  expect(serialized).not.toContain("Push, Pop, dan Peek bekerja pada satu ujung Stack");
  await answerStackQuiz(page);
  await expect(page.getByText("Hasil quiz", { exact: true })).toBeVisible();
  await expect(page.getByText(/tidak disimpan.*guest/)).toBeVisible();
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.getByText("Pertanyaan 1 dari 10")).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("keeps Stack visualizer, curriculum, and quiz usable at 390 by 844", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/visualizer/stack", "/learn/stack", "/learn/stack/quiz"]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(page.getByText("Pertanyaan 1 dari 10")).toBeVisible();
  await answerStackQuiz(page);
  await expect(page.getByText("Hasil quiz", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(browserErrors).toEqual([]);
});
