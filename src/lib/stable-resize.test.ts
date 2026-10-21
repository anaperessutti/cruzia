import { describe, expect, test } from "bun:test";
import { isToolbarResize } from "./stable-resize";

describe("toolbar-only resize", () => {
  test("ignores the reported 839 to 873 height change at the same width", () => {
    expect(isToolbarResize({ width: 390, height: 839 }, { width: 390, height: 873 })).toBe(true);
  });
  test("does not ignore a change of 150px", () => {
    expect(isToolbarResize({ width: 390, height: 839 }, { width: 390, height: 989 })).toBe(false);
  });
  test("does not ignore a width change", () => {
    expect(isToolbarResize({ width: 390, height: 839 }, { width: 391, height: 873 })).toBe(false);
  });
});