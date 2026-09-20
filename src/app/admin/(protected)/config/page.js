import { GlassPanel } from "@/components/ui/glass-panel";
import { KeepAlivePingButton } from "@/components/admin/keepalive-ping-button";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatPingTime, keepAliveStatus, timeAgo } from "@/lib/keepalive";

const STATUS_STYLES = {
  ok: "text-emerald-500",
  soon: "text-amber-500",
  overdue: "text-red-500",
  never: "text-amber-500",
};

export default async function AdminConfigPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [recent, lastCron] = await Promise.all([
    supabase
      .from("keepalive_pings")
      .select("id, triggered_at, source, triggered_by")
      .order("triggered_at", { ascending: false })
      .limit(10),
    supabase
      .from("keepalive_pings")
      .select("triggered_at")
      .eq("source", "cron")
      .order("triggered_at", { ascending: false })
      .limit(1),
  ]);

  const tableMissing = recent.error?.code === "PGRST205";
  if (recent.error && !tableMissing) throw recent.error;

  const pings = recent.data ?? [];
  const lastPing = pings[0] ?? null;
  const lastCronPing = lastCron.data?.[0] ?? null;
  const status = keepAliveStatus(lastPing?.triggered_at);
  const cronSecretSet = Boolean(process.env.CRON_SECRET);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Config</h1>

      {tableMissing ? (
        <GlassPanel hover={false} className="p-6">
          <p className="text-sm font-medium text-red-500">
            The keep-alive table doesn&apos;t exist yet. Run{" "}
            <code>supabase/005_keepalive.sql</code> in the Supabase SQL editor, then reload.
          </p>
        </GlassPanel>
      ) : (
        <>
          <GlassPanel hover={false} className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-tight text-ink">Keep Supabase awake</h2>
              <p className="max-w-2xl text-sm text-ink-soft">
                Free Supabase projects are paused after about a week without activity. Pinging
                writes one small row to the database, which counts as activity. Do it about once a
                week &mdash; or let the automatic ping below handle it.
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  Last triggered
                </dt>
                <dd className="text-sm text-ink">
                  {lastPing ? (
                    <>
                      {formatPingTime(lastPing.triggered_at)}
                      <span className="text-ink-faint"> &middot; {timeAgo(lastPing.triggered_at)}</span>
                      <span className="block text-xs text-ink-faint">
                        {lastPing.source === "cron" ? "Automatic (cron)" : "Manual"}
                        {lastPing.triggered_by && lastPing.source === "manual"
                          ? ` by ${lastPing.triggered_by}`
                          : ""}
                      </span>
                    </>
                  ) : (
                    "Never"
                  )}
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Status</dt>
                <dd className="text-sm">
                  <span className={`font-semibold ${STATUS_STYLES[status.level]}`}>{status.label}</span>
                  <span className="block text-xs text-ink-faint">{status.detail}</span>
                </dd>
              </div>
            </dl>

            <KeepAlivePingButton />
          </GlassPanel>

          <GlassPanel hover={false} className="flex flex-col gap-3 p-6">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Automatic ping</h2>
            <p className="max-w-2xl text-sm text-ink-soft">
              A Vercel Cron job calls <code>/api/cron/keepalive</code> every Monday and Thursday at
              09:00 UTC (5:00 PM Philippine time). Twice a week rather than once, so a missed or
              delayed run can&apos;t let the gap reach a full week.
            </p>
            <p className="text-sm text-ink">
              Last automatic ping:{" "}
              {lastCronPing ? (
                <>
                  {formatPingTime(lastCronPing.triggered_at)}
                  <span className="text-ink-faint"> &middot; {timeAgo(lastCronPing.triggered_at)}</span>
                </>
              ) : (
                <span className="text-ink-faint">none recorded yet</span>
              )}
            </p>
            {cronSecretSet ? null : (
              <p className="text-sm font-medium text-amber-500">
                <code>CRON_SECRET</code> isn&apos;t set on this deployment, so the scheduled ping
                will be rejected. Add it under Vercel &rarr; Settings &rarr; Environment Variables
                and redeploy.
              </p>
            )}
            <p className="text-xs text-ink-faint">
              The schedule lives in <code>vercel.json</code>; changing it means editing that file and
              redeploying.
            </p>
          </GlassPanel>

          <div className="glass overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-120 text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                    <th className="px-5 py-3">When</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">By</th>
                  </tr>
                </thead>
                <tbody>
                  {pings.map((ping) => (
                    <tr key={ping.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 text-ink">{formatPingTime(ping.triggered_at)}</td>
                      <td className="px-5 py-3 text-ink-soft">
                        {ping.source === "cron" ? "Automatic" : "Manual"}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{ping.triggered_by ?? "—"}</td>
                    </tr>
                  ))}
                  {pings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-ink-faint">
                        No pings yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
