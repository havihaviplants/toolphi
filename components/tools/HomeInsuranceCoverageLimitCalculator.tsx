// components/tools/HomeInsuranceCoverageLimitCalculator.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Inputs = {
  squareFeet: string;
  rebuildCostPerSqFt: string;

  upgradesCost: string; // optional
  debrisRemovalPercent: string; // optional (common add-on assumptions)
  bufferPercent: string; // optional safety margin for inflation/underestimate
};

type Result = {
  baseRebuildCost: number;
  upgradesCost: number;
  subtotalBeforeDebris: number;
  debrisRemovalCost: number;
  subtotalAfterDebris: number;
  bufferCost: number;
  recommendedDwellingLimit: number;
  notes: string[];
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function HomeInsuranceCoverageLimitCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    squareFeet: "",
    rebuildCostPerSqFt: "",
    upgradesCost: "",
    debrisRemovalPercent: "5",
    bufferPercent: "10",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const squareFeet = parseNumber(inputs.squareFeet);
    const rebuildCostPerSqFt = parseNumber(inputs.rebuildCostPerSqFt);

    const upgradesCost = inputs.upgradesCost.trim().length === 0 ? 0 : parseNumber(inputs.upgradesCost);
    const debrisRemovalPercent =
      inputs.debrisRemovalPercent.trim().length === 0 ? 0 : parseNumber(inputs.debrisRemovalPercent);
    const bufferPercent =
      inputs.bufferPercent.trim().length === 0 ? 0 : parseNumber(inputs.bufferPercent);

    if (!Number.isFinite(squareFeet) || squareFeet <= 0) {
      setError("Square footage must be a valid number greater than 0.");
      return;
    }
    if (!Number.isFinite(rebuildCostPerSqFt) || rebuildCostPerSqFt <= 0) {
      setError("Rebuild cost per sq ft must be a valid number greater than 0.");
      return;
    }
    if (!Number.isFinite(upgradesCost) || upgradesCost < 0) {
      setError("Upgrades cost must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(debrisRemovalPercent) || debrisRemovalPercent < 0 || debrisRemovalPercent > 50) {
      setError("Debris removal % must be between 0 and 50.");
      return;
    }
    if (!Number.isFinite(bufferPercent) || bufferPercent < 0 || bufferPercent > 50) {
      setError("Buffer % must be between 0 and 50.");
      return;
    }

    const baseRebuildCost = squareFeet * rebuildCostPerSqFt;
    const subtotalBeforeDebris = baseRebuildCost + upgradesCost;

    const debrisRemovalCost = subtotalBeforeDebris * (debrisRemovalPercent / 100);
    const subtotalAfterDebris = subtotalBeforeDebris + debrisRemovalCost;

    const bufferCost = subtotalAfterDebris * (bufferPercent / 100);
    const recommendedDwellingLimit = subtotalAfterDebris + bufferCost;

    const notes: string[] = [];
    notes.push("This calculator estimates dwelling coverage using rebuild cost, not market value.");
    notes.push("Local labor/material costs vary—use region-specific rebuild cost per sq ft when possible.");
    if (bufferPercent > 0) notes.push("Buffer helps account for inflation and underestimation risk.");

    setResult({
      baseRebuildCost,
      upgradesCost,
      subtotalBeforeDebris,
      debrisRemovalCost,
      subtotalAfterDebris,
      bufferCost,
      recommendedDwellingLimit,
      notes,
    });
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e1e4e8",
        padding: 16,
        backgroundColor: "#fff",
        display: "grid",
        gap: 16,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Home size (square feet)</label>
            <input
              name="squareFeet"
              value={inputs.squareFeet}
              onChange={handleChange}
              placeholder="e.g. 2000"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Rebuild cost per sq ft</label>
            <input
              name="rebuildCostPerSqFt"
              value={inputs.rebuildCostPerSqFt}
              onChange={handleChange}
              placeholder="e.g. 200"
              inputMode="decimal"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Optional adjustments</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Upgrades / finishes cost (optional)</label>
              <input
                name="upgradesCost"
                value={inputs.upgradesCost}
                onChange={handleChange}
                placeholder="e.g. 20000"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Debris removal (%)</label>
              <input
                name="debrisRemovalPercent"
                value={inputs.debrisRemovalPercent}
                onChange={handleChange}
                placeholder="e.g. 5"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Safety buffer (%)</label>
              <input
                name="bufferPercent"
                value={inputs.bufferPercent}
                onChange={handleChange}
                placeholder="e.g. 10"
                inputMode="decimal"
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              />
            </div>
          </div>

          {error ? (
            <div
              style={{
                background: "#fff5f5",
                border: "1px solid #fed7d7",
                color: "#c53030",
                padding: 10,
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Calculate
          </button>
        </div>
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8, fontSize: 14 }}>
          <div>
            <strong>Base rebuild cost:</strong> {fmt(result.baseRebuildCost)}
          </div>
          <div>
            <strong>Upgrades added:</strong> {fmt(result.upgradesCost)}
          </div>
          <div>
            <strong>Subtotal (before debris):</strong> {fmt(result.subtotalBeforeDebris)}
          </div>
          <div>
            <strong>Debris removal cost:</strong> {fmt(result.debrisRemovalCost)}
          </div>
          <div>
            <strong>Subtotal (after debris):</strong> {fmt(result.subtotalAfterDebris)}
          </div>
          <div>
            <strong>Buffer added:</strong> {fmt(result.bufferCost)}
          </div>

          <div style={{ marginTop: 6, fontWeight: 900 }}>
            Recommended dwelling coverage limit: {fmt(result.recommendedDwellingLimit)}
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.notes.map((n, idx) => (
              <div key={idx}>• {n}</div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
