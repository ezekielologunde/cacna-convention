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

afterEach(() => {
  cleanup();
});
