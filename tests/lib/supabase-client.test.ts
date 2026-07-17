import { describe, it, expect, vi, beforeEach } from "vitest";

const createBrowserClientMock = vi.fn(() => ({ __client: "browser" }));
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: createBrowserClientMock,
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  createBrowserClientMock.mockClear();
});

describe("createClient (browser)", () => {
  it("builds a Supabase browser client with the configured URL and anon key", async () => {
    const { createClient } = await import("../../lib/supabase/client");
    const client = createClient();

    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key"
    );
    expect(client).toEqual({ __client: "browser" });
  });
});
