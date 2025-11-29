"use client";

import { useState } from "react";

export default function RefundButton({ depositId, disabled }: { depositId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onRefund() {
    setError(null);
    if (!confirm("Refund this deposit? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch("/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Refund failed");
      setOk(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Refund failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button onClick={onRefund} disabled={loading || ok || disabled} className="rounded-md border border-white/20 text-white px-3 py-1 text-xs hover:bg-white/10 disabled:opacity-60">
        {ok ? "Refunded" : loading ? "Refunding…" : "Refund"}
      </button>
      {error && <div className="text-red-400 text-xs">{error}</div>}
    </div>
  );
}

