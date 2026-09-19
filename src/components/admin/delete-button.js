"use client";

import { SubmitButton } from "@/components/admin/submit-button";

export function DeleteButton({ action, confirmMessage = "Delete this item?" }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <SubmitButton
        pendingText={"Deleting…"}
        className="text-sm font-medium text-red-500 hover:underline disabled:opacity-60"
      >
        Delete
      </SubmitButton>
    </form>
  );
}
