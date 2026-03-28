import { expect, test } from "@playwright/test";

test("all primary pages render and core flows stay functional", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "typingtrainer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Phase 2 vertical slice" })).toBeVisible();

  await page.getByRole("link", { name: "Lessons" }).click();
  await expect(page.getByRole("heading", { name: "Guided beginner ladder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stage 1: Home Row Stability" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Code crossover lessons" })).toBeVisible();

  await page.getByRole("link", { name: "Start lesson" }).first().click();
  await expect(page.getByRole("heading", { name: "Home Row Foundations" })).toBeVisible();

  const lessonCapture = page.getByLabel("Lesson typing capture");
  await lessonCapture.focus();
  await lessonCapture.pressSequentially("asdf jkl;");
  await lessonCapture.pressSequentially("sad lad; ask flask");
  await lessonCapture.pressSequentially("all fall; ask dad");

  const sessionSummary = page.locator(".summary-grid");
  await expect(sessionSummary).toContainText("Session save state:", { timeout: 10000 });

  await page.getByRole("link", { name: "Stats" }).click();
  await expect(page.getByRole("heading", { name: "Stored session summaries" })).toBeVisible();
  await expect(page.getByText("Sessions completed")).toBeVisible();
  await expect(page.getByText("Recent progress")).toBeVisible();
  await expect(page.getByText("Home Row Foundations")).toBeVisible();

  await page.getByRole("link", { name: "Adaptive" }).click();
  await expect(page.getByRole("heading", { name: "Generated adaptive session" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why this session was generated" })).toBeVisible();

  await page.getByRole("button", { name: "Generate next session" }).click();
  await expect(page.getByRole("heading", { name: "Adaptive runner" })).toBeVisible();

  await page.getByRole("link", { name: "Free Practice" }).click();
  await expect(page.getByRole("heading", { name: "Keyboard event inspection" })).toBeVisible();
  const freePracticeCapture = page.getByLabel("Free practice keyboard capture");
  await freePracticeCapture.focus();
  await freePracticeCapture.press("a");
  await expect(page.getByRole("heading", { name: "Most recent keystroke" })).toBeVisible();
  await expect(
    page.locator(".metric-card").filter({ has: page.getByText("Code") }).getByText("KeyA"),
  ).toBeVisible();

  await page.getByRole("link", { name: "Coding" }).click();
  await expect(page.getByRole("heading", { name: "Typing-first code practice" })).toBeVisible();
  await expect(page.getByText("Python Function Flow")).toBeVisible();
  await expect(page.getByText("C Register Rhythm")).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Technique defaults" })).toBeVisible();
  await page.locator("select").selectOption("guided");
  await expect(page.getByText("Save state:")).toBeVisible();
  await expect(page.getByText("saved")).toBeVisible();
  await expect(page.getByText("Strictness: guided")).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Phase 2 vertical slice" })).toBeVisible();

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
