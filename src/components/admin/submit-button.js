"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that disables itself while its form's action is pending.
 * Must be rendered as a descendant of the <form> it guards (a requirement
 * of useFormStatus) — this is why it's a separate component rather than a
 * plain <button> inside the form-owning component.
 */
export function SubmitButton({ children, pendingText = "Saving…", className = "", disabled = false }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
