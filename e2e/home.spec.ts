import { expect, test } from "@playwright/test";

test("opens the homepage with Struktiva branding and no fatal page error", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("banner").getByText("Struktiva")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Interactive Data Structures Learning Platform",
    }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});
