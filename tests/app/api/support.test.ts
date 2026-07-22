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
  return new Request("http://localhost/api/support", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const VALID_BODY = { name: "  Jane Doe  ", email: "  Person@Example.com  ", subject: "  Check-in question  ", message: "  What time does check-in open?  " };

describe("POST /api/support", () => {
  it("inserts a trimmed, lowercased-email ticket with no attendee_id and returns success", async () => {
    insertMock.mockResolvedValue({ error: null });
    const { POST } = await import("../../../app/api/support/route");

    const res = await POST(makeRequest(VALID_BODY));
    const json = await res.json();

    expect(json).toEqual({ status: "success" });
    expect(insertMock).toHaveBeenCalledWith({
      attendee_id: null,
      name: "Jane Doe",
      email: "person@example.com",
      subject: "Check-in question",
      message: "What time does check-in open?",
    });
  });

  it("allows an empty name (optional field)", async () => {
    insertMock.mockResolvedValue({ error: null });
    const { POST } = await import("../../../app/api/support/route");

    const { name, ...withoutName } = VALID_BODY;
    void name;
    const res = await POST(makeRequest(withoutName));
    const json = await res.json();

    expect(json).toEqual({ status: "success" });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ name: null }));
  });

  it("rejects an invalid email without inserting", async () => {
    const { POST } = await import("../../../app/api/support/route");

    const res = await POST(makeRequest({ ...VALID_BODY, email: "not-an-email" }));

    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a missing subject without inserting", async () => {
    const { POST } = await import("../../../app/api/support/route");

    const res = await POST(makeRequest({ ...VALID_BODY, subject: "" }));

    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a missing message without inserting", async () => {
    const { POST } = await import("../../../app/api/support/route");

    const res = await POST(makeRequest({ ...VALID_BODY, message: "" }));

    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("silently accepts a filled honeypot field without inserting or calling Supabase at all", async () => {
    const { POST } = await import("../../../app/api/support/route");

    const res = await POST(makeRequest({ ...VALID_BODY, website: "http://spam.example" }));
    const json = await res.json();

    expect(json).toEqual({ status: "success" });
    expect(insertMock).not.toHaveBeenCalled();
    expect(createServiceClientMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid JSON", async () => {
    const { POST } = await import("../../../app/api/support/route");
    const badRequest = new Request("http://localhost/api/support", { method: "POST", body: "{not json" });

    const res = await POST(badRequest);

    expect(res.status).toBe(400);
  });

  it("returns 500 on an unexpected insert error", async () => {
    insertMock.mockResolvedValue({ error: { code: "XX000", message: "unexpected" } });
    const { POST } = await import("../../../app/api/support/route");

    const res = await POST(makeRequest(VALID_BODY));

    expect(res.status).toBe(500);
  });
});
