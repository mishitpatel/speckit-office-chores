import { test, expect } from "@playwright/test";

/**
 * Demo path covered by Polish task T115. Mirrors the smoke described in
 * /specs/001-office-chores-calendar/quickstart.md. Requires both the dev
 * server (vite) and the API server (tsx) to be running — see
 * `playwright.config.ts` which boots both via `webServer`.
 *
 * Run locally with `npm --workspace client run test:e2e`. Not wired into
 * the default `npm test` because Playwright requires browser binaries
 * (`npx playwright install chromium`).
 */
test.describe("Office Chores demo", () => {
  test("create → reschedule → done → delete", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Alex").first()).toBeVisible();

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayCell = page.locator(`[data-date="${yyyy}-${mm}-${dd}"]`).first();
    await todayCell.click();

    await page.getByTestId("chore-form-title").fill("Empty dishwasher");
    await page.getByTestId("chore-form-submit").click();

    await expect(page.getByText("Empty dishwasher")).toBeVisible();

    const chip = page.getByTestId("chore-chip").first();
    await chip.getByTestId("chore-chip-done").click();
    await expect(chip).toHaveAttribute("data-done", "true");

    await chip.getByTestId("chore-chip-body").click();
    await page.getByTestId("chore-form-delete").click();
    await page.getByTestId("chore-form-delete-confirm").click();

    await expect(page.getByText("Empty dishwasher")).not.toBeVisible();
  });

  test("filter to a person and back to All", async ({ page }) => {
    await page.goto("/");
    const alexButton = page
      .getByTestId("roster-item")
      .filter({ hasText: "Alex" })
      .getByTestId("roster-person-name");
    await alexButton.click();
    await expect(page.getByText(/Filtered to Alex/)).toBeVisible();
    await page.getByTestId("roster-all").click();
    await expect(page.getByText(/Filtered to/)).toHaveCount(0);
  });
});
