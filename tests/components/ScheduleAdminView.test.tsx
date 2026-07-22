import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const eqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: eqMock }));
const deleteEqMock = vi.fn();
const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
const insertMock = vi.fn();
const selectEqMock = vi.fn();
const selectMock = vi.fn(() => ({ eq: selectEqMock }));

const createClientMock = vi.fn(() => ({
  from: () => ({
    update: updateMock,
    delete: deleteMock,
    insert: insertMock,
    select: selectMock,
  }),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: createClientMock,
}));

// Dynamically imported (rather than a static top-level import) so this
// module -- and its own static "@/lib/supabase/client"/"next/navigation"
// imports -- only loads after the mock consts above have actually
// initialized; a static import gets hoisted ahead of them and throws
// "Cannot access ... before initialization" the moment the mock factories
// run. Same reasoning as tests/components/AboutContent.test.tsx.
const { ScheduleAdminView } = await import("../../components/admin/ScheduleAdminView");

const SESSION = {
  id: "s1",
  day_date: "2027-07-14",
  starts_at: "10:00:00",
  ends_at: "11:30:00",
  title: "Ministers' Session 1",
  minister_name: "Pastor Agbeja",
  minister_title: "Regional Supt.",
  track: "ministers",
  audience: ["adult"],
  sort_order: 1,
};

beforeEach(() => {
  refreshMock.mockClear();
  eqMock.mockReset();
  eqMock.mockResolvedValue({ error: null });
  deleteEqMock.mockReset();
  deleteEqMock.mockResolvedValue({ error: null });
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  selectEqMock.mockReset();
  updateMock.mockClear();
  deleteMock.mockClear();
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("ScheduleAdminView", () => {
  it("shows a clone prompt when the edition has no schedule yet", () => {
    render(
      <ScheduleAdminView
        editionId="e-new"
        editionStartsOn="2031-07-10"
        otherEditions={[{ id: "e-2027", year: 2027, starts_on: "2027-07-12" }]}
        initialSessions={[]}
      />
    );

    expect(screen.getByText("No schedule yet for this edition")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clone schedule" })).toBeInTheDocument();
  });

  it("says there's nothing to clone from when no other edition exists", () => {
    render(
      <ScheduleAdminView editionId="e-new" editionStartsOn="2031-07-10" otherEditions={[]} initialSessions={[]} />
    );

    expect(screen.getByText("No other edition has a schedule to clone from yet.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clone schedule" })).not.toBeInTheDocument();
  });

  it("clones sessions with day_date shifted to preserve the day-of-convention offset", async () => {
    // Source edition starts 2027-07-12; this session is 2 days in
    // (2027-07-14). Target edition starts 2031-07-10 -- day 2 there is
    // 2031-07-12, not a copy-pasted 2027 date.
    selectEqMock.mockResolvedValue({
      data: [
        {
          day_date: "2027-07-14",
          starts_at: "10:00:00",
          ends_at: "11:30:00",
          title: "Ministers' Session 1",
          minister_name: "Pastor Agbeja",
          minister_title: "Regional Supt.",
          track: "ministers",
          audience: ["adult"],
          sort_order: 1,
        },
      ],
      error: null,
    });

    render(
      <ScheduleAdminView
        editionId="e-new"
        editionStartsOn="2031-07-10"
        otherEditions={[{ id: "e-2027", year: 2027, starts_on: "2027-07-12" }]}
        initialSessions={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Clone schedule" }));

    await vi.waitFor(() => expect(insertMock).toHaveBeenCalled());
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({ edition_id: "e-new", day_date: "2031-07-12", title: "Ministers' Session 1" }),
    ]);
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows an error, without inserting, when the chosen source has no schedule to clone", async () => {
    selectEqMock.mockResolvedValue({ data: [], error: null });

    render(
      <ScheduleAdminView
        editionId="e-new"
        editionStartsOn="2031-07-10"
        otherEditions={[{ id: "e-2027", year: 2027, starts_on: "2027-07-12" }]}
        initialSessions={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Clone schedule" }));

    expect(await screen.findByText("2027 has no schedule to clone.")).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("renders existing sessions grouped by day, with minister/track/audience summary", () => {
    render(
      <ScheduleAdminView editionId="e-2027" editionStartsOn="2027-07-12" otherEditions={[]} initialSessions={[SESSION]} />
    );

    expect(screen.getByText("2027-07-14")).toBeInTheDocument();
    expect(screen.getByText("Ministers' Session 1")).toBeInTheDocument();
    expect(screen.getByText("Pastor Agbeja — Regional Supt. · ministers · adult")).toBeInTheDocument();
  });

  it("edits a session: Edit reveals a form, Save updates it and Cancel discards changes", async () => {
    render(
      <ScheduleAdminView editionId="e-2027" editionStartsOn="2027-07-12" otherEditions={[]} initialSessions={[SESSION]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const titleInput = screen.getByDisplayValue("Ministers' Session 1");
    fireEvent.change(titleInput, { target: { value: "Ministers' Session 1 (Updated)" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await vi.waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Ministers' Session 1 (Updated)", audience: ["adult"] })
    );
    expect(eqMock).toHaveBeenCalledWith("id", "s1");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("cancelling an edit restores the read-only row without saving", () => {
    render(
      <ScheduleAdminView editionId="e-2027" editionStartsOn="2027-07-12" otherEditions={[]} initialSessions={[SESSION]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Ministers' Session 1")).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("deletes a session after confirming", async () => {
    render(
      <ScheduleAdminView editionId="e-2027" editionStartsOn="2027-07-12" otherEditions={[]} initialSessions={[SESSION]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await vi.waitFor(() => expect(deleteEqMock).toHaveBeenCalledWith("id", "s1"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("does not delete when the confirm dialog is dismissed", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <ScheduleAdminView editionId="e-2027" editionStartsOn="2027-07-12" otherEditions={[]} initialSessions={[SESSION]} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("adds a new session with the entered fields, defaulting audience to 'all' when none checked", async () => {
    render(
      <ScheduleAdminView editionId="e-2027" editionStartsOn="2027-07-12" otherEditions={[]} initialSessions={[SESSION]} />
    );

    const addSection = screen.getByText("Add a session").closest("section")!;
    fireEvent.change(within(addSection).getByLabelText("Date"), { target: { value: "2027-07-15" } });
    fireEvent.change(within(addSection).getByLabelText("Title"), { target: { value: "New Session" } });

    fireEvent.click(within(addSection).getByRole("button", { name: "Add session" }));

    await vi.waitFor(() => expect(insertMock).toHaveBeenCalled());
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ edition_id: "e-2027", day_date: "2027-07-15", title: "New Session", audience: ["all"] })
    );
    expect(refreshMock).toHaveBeenCalled();
  });

  it("disables the Add session button until a date and title are entered", () => {
    render(
      <ScheduleAdminView editionId="e-2027" editionStartsOn="2027-07-12" otherEditions={[]} initialSessions={[SESSION]} />
    );

    const addSection = screen.getByText("Add a session").closest("section")!;
    expect(within(addSection).getByRole("button", { name: "Add session" })).toBeDisabled();
  });
});
