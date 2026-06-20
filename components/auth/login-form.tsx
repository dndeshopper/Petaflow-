"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { s } from "@/lib/export-style";

type AuthMode = "sign-in" | "sign-up" | "magic-link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authError === "auth"
      ? "Accesso non riuscito. Riprova o richiedi un nuovo link."
      : null
  );
  const [isError, setIsError] = useState(Boolean(authError));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage("Inserisci la tua email.");
      setIsError(true);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (mode === "magic-link") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setMessage("Controlla la tua email: ti abbiamo inviato un link di accesso.");
        setIsError(false);
        return;
      }

      if (mode === "sign-up") {
        if (password.length < 8) {
          throw new Error("La password deve avere almeno 8 caratteri.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: fullName.trim() || trimmedEmail.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;

        if (data.session) {
          router.replace(next);
          router.refresh();
          return;
        }

        setMessage("Account creato. Controlla la email per confermare l'accesso.");
        setIsError(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) throw error;

      router.replace(next);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Accesso non riuscito.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={s("display:flex; flex-direction:column; gap:16px;")}>
      <div style={s("display:flex; gap:8px;")}>
        {(
          [
            ["sign-in", "Accedi"],
            ["sign-up", "Registrati"],
            ["magic-link", "Link email"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setMessage(null);
              setIsError(false);
            }}
            style={s(
              `flex:1; border-radius:10px; padding:10px 12px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid ${
                mode === value ? "#1c1b1a" : "#eeedeb"
              }; background:${mode === value ? "#1c1b1a" : "#fff"}; color:${
                mode === value ? "#fff" : "#5b5955"
              };`
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "sign-up" && (
        <label style={s("display:flex; flex-direction:column; gap:7px;")}>
          <span style={s("font-size:12.5px; font-weight:600; color:#6f6d69;")}>Nome</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="Il tuo nome"
            style={s(
              "border:1px solid #eeedeb; border-radius:12px; padding:12px 14px; font-size:14px; outline:none;"
            )}
          />
        </label>
      )}

      <label style={s("display:flex; flex-direction:column; gap:7px;")}>
        <span style={s("font-size:12.5px; font-weight:600; color:#6f6d69;")}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="nome@email.com"
          style={s(
            "border:1px solid #eeedeb; border-radius:12px; padding:12px 14px; font-size:14px; outline:none;"
          )}
        />
      </label>

      {mode !== "magic-link" && (
        <label style={s("display:flex; flex-direction:column; gap:7px;")}>
          <span style={s("font-size:12.5px; font-weight:600; color:#6f6d69;")}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            required
            placeholder={mode === "sign-up" ? "Minimo 8 caratteri" : "La tua password"}
            style={s(
              "border:1px solid #eeedeb; border-radius:12px; padding:12px 14px; font-size:14px; outline:none;"
            )}
          />
        </label>
      )}

      {message && (
        <p
          style={s(
            `font-size:13px; line-height:1.45; margin:0; color:${isError ? "#c0392b" : "#3d7a52"};`
          )}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={s(
          `border:none; border-radius:12px; padding:13px 16px; font-size:14.5px; font-weight:700; cursor:pointer; background:#6c5ce7; color:#fff; opacity:${loading ? 0.7 : 1};`
        )}
      >
        {loading
          ? "Attendere..."
          : mode === "magic-link"
            ? "Invia link di accesso"
            : mode === "sign-up"
              ? "Crea account"
              : "Accedi"}
      </button>
    </form>
  );
}
