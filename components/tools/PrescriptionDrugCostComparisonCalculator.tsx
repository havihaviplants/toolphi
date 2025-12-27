"use client";

import { useMemo, useState } from "react";

const num = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const int = (v: string) => {
  const n = Math.floor(num(v));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const usd = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(v);

export default function PrescriptionDrugCostComparisonCalculator() {
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [months, setMonths] = useState("12");

  const m = useMemo(() => Math.max(1, int(months)), [months]);

  const aTotal = useMemo(() => num(optionA) * m, [optionA, m]);
  const bTotal = useMemo(() => num(optionB) * m, [optionB, m]);

  const cheaper =
    aTotal === bTotal ? "Tie" : aTotal < bTotal ? "Option A" : "Option B";
  const diff = Math.abs(aTotal - bTotal);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22 }}>
        Prescription Drug Cost Comparison Calculator
      </h1>
      <p style={{ color: "#4b5563" }}>
        Compare prescription drug costs between two options (brand vs generic,
        or pharmacy A vs pharmacy B) over a chosen time period.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input
          placeholder="Option A monthly cost"
          value={optionA}
          onChange={(e) => setOptionA(e.target.value)}
        />
        <input
          placeholder="Option B monthly cost"
          value={optionB}
          onChange={(e) => setOptionB(e.target.value)}
        />
        <input
          placeholder="Months to compare (e.g. 12)"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#f9fafb" }}>
        <div>Option A total ({m} months): <strong>{usd(aTotal)}</strong></div>
        <div>Option B total ({m} months): <strong>{usd(bTotal)}</strong></div>
        <div style={{ marginTop: 6 }}>
          Cheaper option: <strong>{cheaper}</strong>
        </div>
        <div>Difference: <strong>{usd(diff)}</strong></div>
      </div>

      <p style={{ marginTop: 10, color: "#6b7280", fontSize: 12 }}>
        Tip: Use Option A for “brand” and Option B for “generic” (or two pharmacies) to compare savings.
      </p>
    </div>
  );
}
