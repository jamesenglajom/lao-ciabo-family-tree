import { GlassPanel } from "@/components/ui/glass-panel";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <GlassPanel hover={false} className="w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-ink">Admin sign in</h1>
          <p className="text-sm text-ink-soft">The Lao &ndash; Ciabo Family Tree</p>
        </div>
        <LoginForm />
      </GlassPanel>
    </div>
  );
}
