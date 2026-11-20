import { expect, test } from "@playwright/test";

test("the login page shows its heading without the backend", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: "ログイン" }),
  ).toBeVisible();
});
