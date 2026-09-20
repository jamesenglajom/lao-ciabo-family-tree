import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when that env var
// is set on the project. With no secret configured this fails closed, so the
// endpoint can never be triggered by an anonymous visitor.
function isAuthorized(header) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header ?? "");
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

export async function GET(request) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // A real write (not just a read) so it counts as project activity.
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("keepalive_pings")
    .insert({ source: "cron", triggered_by: "Vercel Cron" });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, at: new Date().toISOString() });
}
