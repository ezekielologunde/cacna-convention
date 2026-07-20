import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom has no IntersectionObserver -- components/ui/Reveal.tsx uses one for
// scroll-entrance animation. A no-op stub is enough since these tests only
// assert on rendered content, not scroll-triggered visibility.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error -- test-only stub, not a spec-complete IntersectionObserver
globalThis.IntersectionObserver = IntersectionObserverStub;

// jsdom has no window.matchMedia -- components/ui/ThemeToggle.tsx reads it
// to fall back to the OS theme when no stored preference exists. Always
// reports "no match" (light), which is a safe, deterministic default for
// tests that don't specifically exercise dark-mode detection.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

afterEach(() => {
  cleanup();
});
