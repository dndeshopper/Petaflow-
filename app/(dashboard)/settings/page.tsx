import { AskPetalFlow } from "@/components/search/ask-petalflow";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ExtensionSetup } from "@/components/settings/extension-setup";
import { getCurrentUser } from "@/lib/data";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const apiKey = process.env.INTERNAL_API_KEY ?? null;

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-normal text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 text-[13px] font-semibold text-foreground">
              Profile
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground">Name</label>
                <p className="text-[13px] text-foreground">{user.full_name}</p>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Email</label>
                <p className="text-[13px] text-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Plan</label>
                <p className="text-[13px] text-foreground">
                  {user.is_pro ? "Pro" : "Free"}
                </p>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">User ID</label>
                <p className="font-mono text-[12px] text-foreground">{user.id}</p>
              </div>
            </div>
            <div className="mt-4">
              <SignOutButton
                label="Sign out"
                className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-destructive hover:bg-muted"
              />
            </div>
          </section>

          <ExtensionSetup appUrl={appUrl} apiKey={apiKey} userId={user.id} />

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 text-[13px] font-semibold text-foreground">
              AI Provider
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Configure via <code className="text-[12px]">AI_PROVIDER</code> env
              variable: openai, claude, gemini, or local.
            </p>
          </section>
        </div>

        <div className="h-[500px]">
          <AskPetalFlow />
        </div>
      </div>
    </div>
  );
}
