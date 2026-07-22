import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const createAttendeeClientMock = vi.fn(async () => ({
  auth: { getUser: getUserMock },
}));

const selectResultMock = vi.fn();
const insertMock = vi.fn();
const deleteEqMock = vi.fn();
const createServiceClientMock = vi.fn(() => ({
  from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: selectResultMock }) }),
    insert: insertMock,
    delete: () => ({ eq: deleteEqMock }),
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAttendeeClient: createAttendeeClientMock,
  createServiceClient: createServiceClientMock,
}));

beforeEach(() => {
  getUserMock.mockReset();
  selectResultMock.mockReset();
  insertMock.mockReset();
  deleteEqMock.mockReset();
});

describe("/api/account/notifications", () => {
  describe("GET", () => {
    it("returns 401 when not signed in", async () => {
      getUserMock.mockResolvedValue({ data: { user: null } });
      const { GET } = await import("../../../app/api/account/notifications/route");

      const res = await GET();

      expect(res.status).toBe(401);
    });

    it("returns subscribed: true when a matching newsletter row exists", async () => {
      getUserMock.mockResolvedValue({ data: { user: { email: "person@example.com" } } });
      selectResultMock.mockResolvedValue({ data: { id: "sub-1" }, error: null });
      const { GET } = await import("../../../app/api/account/notifications/route");

      const res = await GET();
      const json = await res.json();

      expect(json).toEqual({ subscribed: true });
    });

    it("returns subscribed: false when no matching row exists", async () => {
      getUserMock.mockResolvedValue({ data: { user: { email: "person@example.com" } } });
      selectResultMock.mockResolvedValue({ data: null, error: null });
      const { GET } = await import("../../../app/api/account/notifications/route");

      const res = await GET();
      const json = await res.json();

      expect(json).toEqual({ subscribed: false });
    });
  });

  describe("POST", () => {
    it("returns 401 when not signed in, without inserting", async () => {
      getUserMock.mockResolvedValue({ data: { user: null } });
      const { POST } = await import("../../../app/api/account/notifications/route");

      const res = await POST();

      expect(res.status).toBe(401);
      expect(insertMock).not.toHaveBeenCalled();
    });

    it("inserts the signed-in user's own email, not a client-supplied one", async () => {
      getUserMock.mockResolvedValue({ data: { user: { email: "person@example.com" } } });
      insertMock.mockResolvedValue({ error: null });
      const { POST } = await import("../../../app/api/account/notifications/route");

      const res = await POST();
      const json = await res.json();

      expect(insertMock).toHaveBeenCalledWith({ email: "person@example.com" });
      expect(json).toEqual({ subscribed: true });
    });

    it("treats a unique-violation (already subscribed) as success, not an error", async () => {
      getUserMock.mockResolvedValue({ data: { user: { email: "person@example.com" } } });
      insertMock.mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
      const { POST } = await import("../../../app/api/account/notifications/route");

      const res = await POST();

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE", () => {
    it("returns 401 when not signed in", async () => {
      getUserMock.mockResolvedValue({ data: { user: null } });
      const { DELETE } = await import("../../../app/api/account/notifications/route");

      const res = await DELETE();

      expect(res.status).toBe(401);
    });

    it("deletes the signed-in user's own email row", async () => {
      getUserMock.mockResolvedValue({ data: { user: { email: "person@example.com" } } });
      deleteEqMock.mockResolvedValue({ error: null });
      const { DELETE } = await import("../../../app/api/account/notifications/route");

      const res = await DELETE();
      const json = await res.json();

      expect(json).toEqual({ subscribed: false });
    });
  });
});
