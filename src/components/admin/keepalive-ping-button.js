"use client";

import { useActionState } from "react";
import { pingSupabaseAction } from "@/app/admin/(protected)/config/actions";

const initialState = { error: null, success: false };

export function KeepAlivePingButton({ canPing, availableLabel }) {
  const [state, formAction, pending] = useActionState(pingSupabaseAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={pending || !canPing}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        {pending ? "Pinging…" : "Ping Supabase now"}
      </button>

      {canPing ? null : (
        <p className="text-sm text-ink-soft">
          Already pinged recently &mdash; available again {availableLabel}.
        </p>
      )}
      {state?.error ? (
        <p role="alert" className="text-sm font-medium text-red-500">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p role="status" className="text-sm font-medium text-emerald-500">
          Pinged &mdash; Supabase is awake.
        </p>
      ) : null}
    </form>
  );
}
