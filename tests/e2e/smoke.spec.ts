import { expect, test } from "@playwright/test";

test("dashboard loads the scaffold shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "typingtrainer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Phase 2 vertical slice" })).toBeVisible();
  await expect(page.getByText("Active profile:")).toBeVisible();
  await expect(page.getByRole("link", { name: "Start a guided lesson" })).toBeVisible();
});
