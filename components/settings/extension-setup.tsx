"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type HealthStatus = "idle" | "loading" | "ok" | "error";

interface ExtensionSetupProps {
  appUrl: string;
  apiKey: string | null;
}

export function ExtensionSetup({ appUrl, apiKey }: ExtensionSetupProps) {
  const [status, setStatus] = useState<HealthStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Connection failed");
      setStatus("ok");
      setMessage(`Connected — ${data.mode} mode`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Connection failed");
    }
  }, []);

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <h2 className="mb-4 text-[13px] font-semibold text-foreground">
        Chrome Extension
      </h2>
      <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
        Load the unpacked extension from{" "}
        <code className="text-[12px]">chrome-extension/dist</code> after running{" "}
        <code className="text-[12px]">npm run build:extension</code>.
      </p>

      <div className="space-y-3 text-[13px]">
        <div>
          <label className="text-[11px] text-muted-foreground">API URL</label>
          <p className="font-mono text-[12px] text-foreground">{appUrl}</p>
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">API Key</label>
          <p className="font-mono text-[12px] text-foreground">
            {apiKey ?? "Not configured — set INTERNAL_API_KEY in .env.local"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Set in popup → matches INTERNAL_API_KEY in .env.local
          </p>
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">User ID</label>
          <p className="text-[12px] text-muted-foreground">
            Leave empty in demo mode. With Supabase, use your auth user UUID.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={testConnection}>
          {status === "loading" ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : null}
          Test connection
        </Button>
        {status === "ok" ? (
          <span className="flex items-center gap-1 text-[12px] text-petal-sage">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {message}
          </span>
        ) : null}
        {status === "error" ? (
          <span className="flex items-center gap-1 text-[12px] text-destructive">
            <XCircle className="h-3.5 w-3.5" />
            {message}
          </span>
        ) : null}
      </div>
    </section>
  );
}
