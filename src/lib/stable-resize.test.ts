import { describe, test } from "node:test";
import { strictEqual } from "node:assert";
import { isToolbarResize } from "./stable-resize";

describe("toolbar-only resize", () => {
  test("ignores the reported 839 to 873 height change at the same width", () => {
    strictEqual(isToolbarResize({ width: 390, height: 839 }, { width: 390, height: 873 }), true);
  });
  test("does not ignore a change of 150px", () => {
    strictEqual(isToolbarResize({ width: 390, height: 839 }, { width: 390, height: 989 }), false);
  });
  test("does not ignore a width change", () => {
    strictEqual(isToolbarResize({ width: 390, height: 839 }, { width: 391, height: 873 }), false);
  });
});