import { expect, test, type Page } from "@playwright/test";

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function advanceToEnd(page: Page) {
  const next = page.getByRole("button", { name: "Langkah berikutnya" });
  while (await next.isEnabled()) {
    await next.click();
  }
}

test("completes the linked-list insert, restart, search, and validation flow", async ({
  page,
}) => {
  const browserErrors = collectBrowserErrors(page);
  const response = await page.goto("/visualizer/linked-list");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { name: "Linked List Visualizer" })).toBeVisible();
  await expect(page.locator('[data-node-value="10"]')).toBeVisible();

  await page.getByLabel("Nilai (-99 sampai 999)").fill("5");
  await page.getByRole("button", { name: "Insert Head" }).click();
  await expect(page.locator('[data-active="true"]')).toContainText("NODE BARU");

  await page.getByRole("button", { name: "Langkah berikutnya" }).click();
  await expect(page.getByText("Langkah 2 dari 4")).toBeVisible();
  await expect(page.locator('[data-node-value="5"]')).toHaveAttribute(
    "data-visual-state",
    "new",
  );
  await page.getByRole("button", { name: "Langkah berikutnya" }).click();
  await expect(page.locator('[data-active="true"]')).toContainText(
    "fresh.next ← HEAD",
  );
  await advanceToEnd(page);
  await expect(page.locator('[data-node-value="5"]')).toBeVisible();
  await expect(page.getByText("Langkah 4 dari 4")).toBeVisible();

  await page.getByRole("button", { name: "Mulai ulang" }).click();
  await expect(page.getByText("Langkah 1 dari 4")).toBeVisible();
  await expect(page.locator('[data-node-value="5"]')).toHaveCount(0);

  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: "Langkah berikutnya" }).click();
  await expect(page.locator('[data-node-value="5"]')).toHaveAttribute(
    "data-visual-state",
    "found",
  );
  await expect(page.getByText("Nilai ditemukan")).toBeVisible();

  await page.getByLabel("Posisi (indeks mulai 0)").fill("99");
  await page.getByRole("button", { name: "Insert Position" }).click();
  await expect(page.locator("p[role='alert']")).toContainText(
    "Posisi sisip harus berada di antara 0 dan 4",
  );
  expect(browserErrors).toEqual([]);
});

test("fits a 390 by 844 viewport without page-level horizontal overflow", async ({
  page,
}) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/visualizer/linked-list");

  await expect(page.getByRole("heading", { name: "Linked List Visualizer" })).toBeVisible();
  await page.getByRole("button", { name: "Memori" }).click();
  await expect(page.getByText("Alamat simulasi: 0xA100")).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  expect(browserErrors).toEqual([]);
});
