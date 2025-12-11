"use client";

import { useState } from "react";

export default function EffectiveMonthlyInterestRateCalculator() {
  const [apr, setApr] = useState("");
  const [result, setResult] = useState<any>(null);

  const n = (v: string) => Number(v.replace(/,/g, "")) || 0;

  const calc = () => {
    const annual = n(apr);
    if (annual <= 0) return;

    const effectiveMonthly = Math.pow(1 + annual / 100, 1 / 12) - 1;

    setResult({
      monthlyRate: effectiveMonthly * 100,
      decimal: effectiveMonthly
    });
  };

  const fmt = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: 6 });

  return (
    <div>
      <p style={{ fontSize: 14 }}>
        Convert an annual interest rate (APR) to an effective monthly interest rate.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Annual interest rate (APR)"
          value={apr}
          onChange={(e) => setApr(e.target.value)}
        />
      </div>

      <button style={{ marginTop: 16 }} onClick={calc}>
        Calculate
      </button>

      {result && (
        <div style={{ marginTop: 16, background: "#f5f8ff", padding: 12, borderRadius: 6 }}>
          <p>
            <strong>Effective monthly rate:</strong> {fmt(result.monthlyRate)}%
          </p>
          <p>
            <strong>Decimal form:</strong> {fmt(result.decimal)}
          </p>
        </div>
      )}
    </div>
  );
}
