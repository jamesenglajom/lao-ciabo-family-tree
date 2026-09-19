"use client";

export function DeleteButton({ action, confirmMessage = "Delete this item?" }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <button type="submit" className="text-sm font-medium text-red-500 hover:underline">
        Delete
      </button>
    </form>
  );
}
