import { redirect } from "next/navigation";
import { createAttendeeClient } from "@/lib/supabase/server";

export async function requireAttendee(locale: string) {
  const supabase = await createAttendeeClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account/login`);
  }

  return { supabase, user };
}
