import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom has no IntersectionObserver -- components/ui/Reveal.tsx and
// components/ui/CountUp.tsx both use one for scroll-triggered entrance/
// count animation. Firing the callback synchronously as "intersecting" as
// soon as something observes treats every such element as already visible,
// which is the useful default for tests asserting on final rendered
// content (e.g. CountUp's target number) rather than scroll timing.
class IntersectionObserverStub {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
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
