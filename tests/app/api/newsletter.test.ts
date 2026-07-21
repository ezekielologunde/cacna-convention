import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({
  from: () => ({ insert: insertMock }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: createServiceClientMock,
}));

beforeEach(() => {
  insertMock.mockReset();
  createServiceClientMock.mockClear();
});

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/newsletter", () => {
  it("inserts a lowercased, trimmed email and returns success", async () => {
    insertMock.mockResolvedValue({ error: null });
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "  Person@Example.com  " }));
    const json = await res.json();

    expect(json).toEqual({ status: "success" });
    expect(insertMock).toHaveBeenCalledWith({ email: "person@example.com" });
  });

  it("returns already_subscribed on a unique-constraint violation", async () => {
    insertMock.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "person@example.com" }));
    const json = await res.json();

    expect(json).toEqual({ status: "already_subscribed" });
  });

  it("rejects an invalid email without inserting", async () => {
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "not-an-email" }));

    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("silently accepts a filled honeypot field without inserting or calling Supabase at all", async () => {
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "person@example.com", website: "http://spam.example" }));
    const json = await res.json();

    expect(json).toEqual({ status: "success" });
    expect(insertMock).not.toHaveBeenCalled();
    expect(createServiceClientMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid JSON", async () => {
    const { POST } = await import("../../../app/api/newsletter/route");
    const badRequest = new Request("http://localhost/api/newsletter", { method: "POST", body: "{not json" });

    const res = await POST(badRequest);

    expect(res.status).toBe(400);
  });

  it("returns 500 on an unexpected insert error", async () => {
    insertMock.mockResolvedValue({ error: { code: "XX000", message: "unexpected" } });
    const { POST } = await import("../../../app/api/newsletter/route");

    const res = await POST(makeRequest({ email: "person@example.com" }));

    expect(res.status).toBe(500);
  });
});
