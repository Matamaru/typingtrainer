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
  await expect(page.getByRole("heading", { name: "Technique achievements" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Session goals" })).toBeVisible();

  await page.getByRole("link", { name: "Lessons" }).click();
  await expect(page.getByRole("heading", { name: "Guided beginner ladder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stage 1: Home Row Stability" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Code crossover lessons" })).toBeVisible();

  await page.getByRole("link", { name: "Start lesson" }).first().click();
  await expect(page.getByRole("heading", { name: "Home Row Foundations" })).toBeVisible();
  await expect(page.locator(".guide-panel")).toBeVisible();

  const lessonCapture = page.getByLabel("Lesson typing capture");
  await lessonCapture.focus();
  await lessonCapture.pressSequentially("asdf jkl;");
  await lessonCapture.pressSequentially("sad lad; ask flask");
  await lessonCapture.pressSequentially("all fall; ask dad");

  const sessionSummary = page.locator(".summary-grid");
  await expect(sessionSummary).toContainText("Session save state:", { timeout: 10000 });
  const nextLessonLink = page.getByRole("link", { name: "Next lesson" });
  await expect(nextLessonLink).toBeVisible();
  await expect(nextLessonLink).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: "Finger Map Anchors" })).toBeVisible();
  await page.getByLabel("Lesson typing capture").focus();
  await expect(page.getByLabel("Lesson typing capture")).toBeFocused();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Alt+Shift+Digit6");

  await expect(page.getByRole("heading", { name: "Stored session summaries" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Achievement wall" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Short and medium goals" })).toBeVisible();
  await expect(page.getByText("Sessions completed")).toBeVisible();
  await expect(page.getByText("Recent progress")).toBeVisible();
  await expect(page.getByText("Home Row Foundations")).toBeVisible();

  await page.keyboard.press("Alt+Shift+Digit3");
  await expect(page.getByRole("heading", { name: "Generated adaptive session" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why this session was generated" })).toBeVisible();

  const adaptivePrompt = page.locator(".lesson-prompt").first();
  const adaptivePromptBefore = await adaptivePrompt.textContent();
  await page.getByLabel("Adaptive lesson typing capture").focus();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Alt+Shift+KeyN");
  await expect(page.getByRole("heading", { name: "Adaptive runner" })).toBeVisible();
  await expect(adaptivePrompt).not.toHaveText(adaptivePromptBefore ?? "");

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
  await expect(page.getByText("Python Identifier Rhythm")).toBeVisible();
  await expect(page.getByText("Python Polling Function")).toBeVisible();
  await expect(page.getByText("C Register Rhythm")).toBeVisible();
  await expect(
    page
      .locator(".lesson-card")
      .filter({ has: page.getByRole("heading", { name: "Python Identifier Rhythm" }) })
      .getByText("Train snake_case names, constants, and short readable identifiers."),
  ).toBeVisible();

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

test("finger guide visibility follows the profile setting", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Technique defaults" })).toBeVisible();

  const fingerGuideToggle = page.getByRole("checkbox", { name: "Show finger guidance overlays" });

  await fingerGuideToggle.uncheck();
  await expect(page.getByText("Save state:")).toContainText("saved");

  await page.goto("/#/lesson/en-home-row-foundations");
  await expect(page.getByRole("heading", { name: "Home Row Foundations" })).toBeVisible();
  await expect(page.locator(".guide-panel")).toHaveCount(0);

  await page.getByRole("link", { name: "Settings" }).click();
  await fingerGuideToggle.check();
  await expect(page.getByText("Save state:")).toContainText("saved");

  await page.goto("/#/lesson/en-home-row-foundations");
  await expect(page.locator(".guide-panel")).toBeVisible();
});
