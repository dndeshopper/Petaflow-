"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export function SignOutButton({
  className,
  style,
  label = "Esci",
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className}
      style={style}
    >
      {loading ? "Uscita..." : label}
    </button>
  );
}
