import { afterEach, describe, expect, it } from "vitest";

/**
 * The inline bootstrap script lives in index.html and runs before React mounts.
 * We exercise its logic here by replicating the small algorithm and asserting
 * that it sets the dark class synchronously based on stored preference.
 */
function bootstrap(): void {
  try {
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let resolved: "dark" | "light" =
      stored === "light" || stored === "dark" ? stored : "dark";
    if (!stored && !systemDark) resolved = "light";
    if (resolved === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch {
    document.documentElement.classList.add("dark");
  }
}

describe("theme bootstrap", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("applies dark class synchronously when stored is dark", () => {
    localStorage.setItem("theme", "dark");
    bootstrap();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("applies light (no class) synchronously when stored is light", () => {
    localStorage.setItem("theme", "light");
    bootstrap();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("falls back to light when nothing is stored and system is light (jsdom default)", () => {
    bootstrap();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
