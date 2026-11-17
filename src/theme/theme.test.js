import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { normalizeThemePreference, resolveTheme } from "./theme.js";

test("unknown or missing preferences fall back to system", () => {
  for (const value of [null, undefined, "", "automatic", "DARK", {}, 1]) {
    assert.equal(normalizeThemePreference(value), "system");
  }
});

test("manual choices take precedence over device settings and time", () => {
  for (const theme of ["light", "dark"]) {
    for (const system of ["light", "dark"]) {
      for (const hour of [0, 7, 12, 19, 23]) {
        assert.equal(resolveTheme(theme, system, new Date(2026, 10, 16, hour)), theme);
      }
    }
  }
});

test("system mode follows either device theme", () => {
  assert.equal(resolveTheme("system", "dark"), "dark");
  assert.equal(resolveTheme("system", "light"), "light");
  assert.equal(resolveTheme("invalid", "dark"), "dark");
});

test("scheduled mode changes at 07:00 and 19:00 in local time", () => {
  const cases = [
    [0, 0, 0, "dark"],
    [6, 59, 59, "dark"],
    [7, 0, 0, "light"],
    [18, 59, 59, "light"],
    [19, 0, 0, "dark"],
    [23, 59, 59, "dark"],
  ];

  for (const [hour, minute, second, expected] of cases) {
    for (const system of ["light", "dark"]) {
      assert.equal(
        resolveTheme("schedule", system, new Date(2026, 10, 16, hour, minute, second)),
        expected,
      );
    }
  }
});

const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const bootstrap = html.match(/<script id="theme-init">([\s\S]*?)<\/script>/)[1];

function runBootstrap(saved, system, date, storageBlocked = false) {
  const dataset = {};
  class FixedDate extends Date {
    constructor() {
      super(date.getTime());
    }
  }

  runInNewContext(bootstrap, {
    Date: FixedDate,
    document: { documentElement: { dataset } },
    window: { matchMedia: () => ({ matches: system === "dark" }) },
    localStorage: {
      getItem: () => {
        if (storageBlocked) throw new Error("Storage disabled");
        return saved;
      },
    },
  });

  return dataset;
}

test("first paint and React resolve every preference identically", () => {
  for (const saved of [null, "invalid", "system", "light", "dark", "schedule"]) {
    for (const system of ["light", "dark"]) {
      for (const hour of [0, 6, 7, 12, 18, 19, 23]) {
        const date = new Date(2026, 10, 16, hour);
        const actual = runBootstrap(saved, system, date);
        assert.equal(actual.themePreference, normalizeThemePreference(saved));
        assert.equal(actual.theme, resolveTheme(saved, system, date));
      }
    }
  }
});

test("blocked browser storage still permits the system theme before first paint", () => {
  const actual = runBootstrap("light", "dark", new Date(2026, 10, 16, 12), true);
  assert.equal(actual.theme, "dark");
  assert.equal(actual.themePreference, "system");
});
