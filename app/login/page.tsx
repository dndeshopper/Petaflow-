import { Suspense } from "react";
import { redirect } from "next/navigation";
import PetalFlowLogo from "@/components/PetalFlowLogo";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { s } from "@/lib/export-style";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  return (
    <div
      style={s(
        "min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f4f3f1; padding:24px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;"
      )}
    >
      <div
        style={s(
          "width:100%; max-width:420px; background:#fff; border:1px solid #ececea; border-radius:20px; box-shadow:0 8px 30px rgba(0,0,0,0.06); padding:34px 32px 32px;"
        )}
      >
        <div style={s("display:flex; justify-content:center; margin-bottom:20px;")}>
          <PetalFlowLogo size={140} showWordmark />
        </div>

        <Suspense fallback={<div style={s("font-size:14px; color:#9a9893;")}>Caricamento...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
