import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /your lectures/i })).toBeVisible();
});

test("new lecture form", async ({ page }) => {
  await page.goto("/lectures/new");
  await expect(page.getByRole("heading", { name: /new lecture/i })).toBeVisible();
});

test("programs page", async ({ page }) => {
  await page.goto("/programs");
  await expect(page.getByRole("heading", { name: /^programs$/i })).toBeVisible();
});
