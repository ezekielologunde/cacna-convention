import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
    // .claude/worktrees holds isolated git worktrees other agent sessions
    // create/remove during the course of a task -- without this, a
    // worktree that outlives its session (or is mid-removal) gets globbed
    // in as a second, stale copy of the entire test suite.
    exclude: ["**/node_modules/**", "**/.claude/worktrees/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
