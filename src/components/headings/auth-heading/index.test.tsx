// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AuthHeading } from "@/components/headings/auth-heading";

it("renders the text as a level 1 heading", () => {
  render(<AuthHeading>ログイン</AuthHeading>);
  expect(
    screen.getByRole("heading", { level: 1, name: "ログイン" }),
  ).toBeDefined();
});
