import "@testing-library/jest-dom/vitest";

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom does not provide a working Storage when the document origin is opaque
// (the default in vitest unless a URL is set). Install a simple in-memory shim
// so tests that exercise localStorage work regardless of jsdom configuration.
function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => {
      map.set(k, String(v));
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    key: (i: number) => Array.from(map.keys())[i] ?? null,
  };
}

if (typeof window !== "undefined") {
  if (!window.localStorage || typeof window.localStorage.clear !== "function") {
    Object.defineProperty(window, "localStorage", { value: makeStorage(), configurable: true });
  }
  if (!window.sessionStorage || typeof window.sessionStorage.clear !== "function") {
    Object.defineProperty(window, "sessionStorage", { value: makeStorage(), configurable: true });
  }
}
