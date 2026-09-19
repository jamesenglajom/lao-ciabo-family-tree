"use client";

import { useActionState } from "react";
import { createUserAction } from "@/app/admin/(protected)/users/actions";

const initialState = { error: null, success: false };

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <input
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
        <select
          name="role"
          defaultValue="manager"
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        >
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create user"}
        </button>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm font-medium text-red-500">
          {state.error}
        </p>
      ) : null}

      {state?.success ? (
        <div className="rounded-2xl border border-line bg-panel-soft p-4 text-sm">
          <p className="font-medium text-ink">
            Created {state.email}. Share this one-time password securely &mdash; it will not be
            shown again:
          </p>
          <p className="mt-2 select-all rounded-xl bg-panel px-3 py-2 font-mono text-accent">
            {state.password}
          </p>
        </div>
      ) : null}
    </form>
  );
}
