import { describe, expect, it } from "vitest";
import { countGraphemes } from "./count-graphemes";

describe("countGraphemes", () => {
  it("counts a family emoji joined by ZWJ as one grapheme", () => {
    expect(countGraphemes("👨‍👩‍👧")).toBe(1);
  });

  it("counts each Japanese character as one grapheme", () => {
    expect(countGraphemes("あいう")).toBe(3);
  });

  it("returns 0 for an empty string", () => {
    expect(countGraphemes("")).toBe(0);
  });
});
