import { signOutAction } from "@/app/admin/(protected)/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="w-full rounded-2xl border border-line px-4 py-2.5 text-left text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
      >
        Sign out
      </button>
    </form>
  );
}
