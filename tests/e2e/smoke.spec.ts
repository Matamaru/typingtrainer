import { expect, test } from "@playwright/test";

test("dashboard loads the scaffold shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "typingtrainer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Phase 2 vertical slice" })).toBeVisible();
  await expect(page.getByText("Active profile:")).toBeVisible();
  const guidedLessonLink = page.getByRole("link", { name: "Start a guided lesson" });
  await expect(guidedLessonLink).toBeVisible();

  await guidedLessonLink.click();

  await expect(page.getByRole("heading", { name: "Guided beginner ladder" })).toBeVisible();
  await expect(page).toHaveURL(/#\/lessons$/);

  await page.getByRole("link", { name: "Stats" }).click();

  await expect(page.getByRole("heading", { name: "Stored session summaries" })).toBeVisible();
  await expect(page).toHaveURL(/#\/stats$/);
});
