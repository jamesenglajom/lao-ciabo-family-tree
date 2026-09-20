"use client";

import { useActionState } from "react";
import { resetUserPasswordAction } from "@/app/admin/(protected)/users/actions";

const initialState = { error: null, success: false };

export function ResetPasswordButton({ userId, email }) {
  const [state, formAction, pending] = useActionState(
    resetUserPasswordAction.bind(null, userId),
    initialState
  );

  return (
    <div className="flex flex-col items-start gap-1.5">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirm(`Reset the password for ${email}? Their current password stops working immediately.`)) {
            event.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          disabled={pending}
          className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
        >
          {pending ? "Resetting…" : "Reset password"}
        </button>
      </form>

      {state?.error ? <p className="text-xs font-medium text-red-500">{state.error}</p> : null}

      {state?.success ? (
        <div className="rounded-xl border border-line bg-panel-soft px-3 py-2 text-xs">
          <p className="font-medium text-ink">New password (shown once):</p>
          <p className="mt-1 w-fit select-all rounded-lg bg-panel px-2 py-1 font-mono text-accent">
            {state.password}
          </p>
        </div>
      ) : null}
    </div>
  );
}
