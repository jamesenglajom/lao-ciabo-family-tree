"use client";

import { useActionState } from "react";
import { signInAction } from "@/app/admin/(auth)/login/actions";

const initialState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm font-medium text-red-500">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
