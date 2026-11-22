// @vitest-environment jsdom
import { afterEach, describe, expect, test } from "vitest";
import { applyUiLocale, uiLang } from "../src/ui-locale.js";

describe("chatbot UI locale", () => {
  afterEach(() => {
    delete document.documentElement.dataset.lang;
    document.documentElement.lang = "zh-CN";
    delete window.lfTranslate;
    document.head.querySelectorAll("script").forEach((node) => node.remove());
  });

  test("reads the same language key as the shell", () => {
    const storage = { getItem: (key) => (key === "loopforge.lang" ? "en" : null) };
    expect(uiLang(storage)).toBe("en");
    expect(uiLang({ getItem: () => "vi" })).toBe("vi");
    expect(uiLang({ getItem: () => { throw new Error("blocked"); } })).toBe("zh");
  });

  test("English mode loads the shell translator before the app renders", async () => {
    const pending = applyUiLocale("en");
    expect(document.head.querySelector("script").src).toBe("http://localhost:3000/i18n-en.js");
    expect(document.documentElement).toHaveAttribute("lang", "en");
    document.head.querySelector("script").onload();
    await Promise.resolve();
    const runtime = [...document.head.querySelectorAll("script")].at(-1);
    expect(runtime.src).toBe("http://localhost:3000/i18n.js");
    window.lfTranslate = (text) => text;
    runtime.onload();
    await pending;
  });

  test("Vietnamese mode loads the Vietnamese dictionary before the runtime", async () => {
    const pending = applyUiLocale("vi");
    expect(document.head.querySelector("script").src).toBe("http://localhost:3000/i18n-vi.js");
    document.head.querySelector("script").onload();
    await Promise.resolve();
    [...document.head.querySelectorAll("script")].at(-1).onload();
    await pending;
    expect(document.documentElement).toHaveAttribute("lang", "vi");
  });

  test("Chinese mode renders immediately", async () => {
    await applyUiLocale("zh");
    expect(document.head.querySelector("script")).toBeNull();
    expect(document.documentElement).toHaveAttribute("lang", "zh-CN");
  });

  test("a missing translator still lets the app render", async () => {
    const pending = applyUiLocale("en");
    document.head.querySelector("script").onerror();
    await expect(pending).rejects.toThrow("/i18n-en.js");
  });
});
