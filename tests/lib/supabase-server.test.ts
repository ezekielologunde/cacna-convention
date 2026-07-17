import { describe, it, expect, vi, beforeEach } from "vitest";

const getAllMock = vi.fn(() => []);
const setMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: getAllMock,
    set: setMock,
  })),
}));

const createServerClientMock = vi.fn(() => ({ __client: "server" }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

const createSupabaseJsClientMock = vi.fn(() => ({ __client: "service" }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: createSupabaseJsClientMock,
}));

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  createServerClientMock.mockClear();
  createSupabaseJsClientMock.mockClear();
});

describe("createClient (server, SSR)", () => {
  it("builds a Supabase server client with the configured URL and anon key", async () => {
    const { createClient } = await import("../../lib/supabase/server");
    const client = await createClient();

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookies: expect.any(Object) })
    );
    expect(client).toEqual({ __client: "server" });
  });
});

describe("createServiceClient", () => {
  it("builds a service-role client with the configured URL and service key", async () => {
    const { createServiceClient } = await import("../../lib/supabase/server");
    const client = createServiceClient();

    expect(createSupabaseJsClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-key",
      expect.objectContaining({
        auth: expect.objectContaining({ autoRefreshToken: false, persistSession: false }),
      })
    );
    expect(client).toEqual({ __client: "service" });
  });
});
