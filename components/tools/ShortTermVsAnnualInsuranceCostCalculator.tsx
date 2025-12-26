"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Inputs = {
  coverageValue: string;
  coverageUnit: "days" | "months";

  shortTermRateValue: string;
  shortTermRateUnit: "per_day" | "per_month";

  annualPremium: string;

  includeFees: "yes" | "no";
  shortTermFees: string;
  annualFees: string;
};

type Result = {
  coverageDays: number;
  coverageMonths: number;

  shortTermTotal: number;
  annualProratedTotal: number;

  cheaperOption: string;
  breakEvenMonths: number | null;

  notes: string[];
};

function parseNumber(v: string): number {
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ShortTermVsAnnualInsuranceCostCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    coverageValue: "3",
    coverageUnit: "months",
    shortTermRateValue: "120",
    shortTermRateUnit: "per_month",
    annualPremium: "900",
    includeFees: "no",
    shortTermFees: "0",
    annualFees: "0",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((p) => ({ ...p, [name]: value }));
  };

  const coverageDays = useMemo(() => {
    const v = parseNumber(inputs.coverageValue);
    if (!Number.isFinite(v)) return NaN;
    return inputs.coverageUnit === "days" ? v : v * 30;
  }, [inputs.coverageValue, inputs.coverageUnit]);

  const coverageMonths = useMemo(() => {
    const v = parseNumber(inputs.coverageValue);
    if (!Number.isFinite(v)) return NaN;
    return inputs.coverageUnit === "months" ? v : v / 30;
  }, [inputs.coverageValue, inputs.coverageUnit]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const coverageValue = parseNumber(inputs.coverageValue);
    const shortTermRateValue = parseNumber(inputs.shortTermRateValue);
    const annualPremium = parseNumber(inputs.annualPremium);

    const includeFees = inputs.includeFees === "yes";
    const shortTermFees = includeFees ? parseNumber(inputs.shortTermFees) : 0;
    const annualFees = includeFees ? parseNumber(inputs.annualFees) : 0;

    if (!Number.isFinite(coverageValue) || coverageValue <= 0) {
      setError("Coverage duration must be greater than 0.");
      return;
    }
    if (!Number.isFinite(shortTermRateValue) || shortTermRateValue < 0) {
      setError("Short-term rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(annualPremium) || annualPremium < 0) {
      setError("Annual premium must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(coverageDays) || coverageDays <= 0 || !Number.isFinite(coverageMonths) || coverageMonths <= 0) {
      setError("Invalid coverage duration.");
      return;
    }
    if (!Number.isFinite(shortTermFees) || shortTermFees < 0) {
      setError("Short-term fees must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(annualFees) || annualFees < 0) {
      setError("Annual fees must be 0 or greater.");
      return;
    }

    // Total short-term cost over the coverage period
    let shortTermTotal = 0;
    if (inputs.shortTermRateUnit === "per_day") {
      shortTermTotal = coverageDays * shortTermRateValue;
    } else {
      shortTermTotal = coverageMonths * shortTermRateValue;
    }
    shortTermTotal += shortTermFees;

    // Prorated annual cost over the same period (approx)
    const annualProratedTotal = annualPremium * (coverageMonths / 12) + annualFees;

    let cheaperOption = "Short-term insurance appears cheaper for this coverage period.";
    if (annualProratedTotal < shortTermTotal) cheaperOption = "Annual insurance appears cheaper for this coverage period.";
    if (Math.abs(annualProratedTotal - shortTermTotal) < 1e-9) cheaperOption = "Both options cost about the same for this coverage period.";

    // Break-even months:
    // Solve: shortTermRateMonthly * m + shortFees = annualPremium*(m/12) + annualFees
    // If shortTermRate is per_day, convert to per_month via *30.
    const shortRateMonthly = inputs.shortTermRateUnit === "per_month" ? shortTermRateValue : shortTermRateValue * 30;
    let breakEvenMonths: number | null = null;

    // m * (shortRateMonthly - annualPremium/12) = (annualFees - shortFees)
    const denom = shortRateMonthly - annualPremium / 12;
    const numer = annualFees - shortTermFees;

    if (Math.abs(denom) > 1e-12) {
      const m = numer / denom;
      if (Number.isFinite(m) && m > 0) breakEvenMonths = m;
    }

    const notes: string[] = [];
    notes.push("This calculator uses simple proration (months as 30 days). Real billing/proration can differ.");
    notes.push("Short-term plans may have different coverage, exclusions, and underwriting rules than annual policies.");
    if (includeFees) notes.push("Fees were included as fixed add-ons (not compounded).");

    setResult({
      coverageDays,
      coverageMonths,
      shortTermTotal,
      annualProratedTotal,
      cheaperOption,
      breakEvenMonths,
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
      <div style={{ display: "grid", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Short-Term vs Annual Insurance Cost Calculator</h1>
        <p style={{ margin: 0, color: "#444", lineHeight: 1.5 }}>
          Compare short-term insurance to an annual policy over your actual coverage period and estimate the break-even point.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Coverage duration</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 8 }}>
            <input
              name="coverageValue"
              value={inputs.coverageValue}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 3"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <select
              name="coverageUnit"
              value={inputs.coverageUnit}
              onChange={handleChange}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Short-term rate</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 8 }}>
            <input
              name="shortTermRateValue"
              value={inputs.shortTermRateValue}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="e.g. 120"
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            />
            <select
              name="shortTermRateUnit"
              value={inputs.shortTermRateUnit}
              onChange={handleChange}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            >
              <option value="per_month">Per month</option>
              <option value="per_day">Per day</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 13 }}>Annual premium</label>
          <input
            name="annualPremium"
            value={inputs.annualPremium}
            onChange={handleChange}
            inputMode="decimal"
            placeholder="e.g. 900"
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
          />
        </div>

        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Optional fees</div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13 }}>Include fees?</label>
            <select
              name="includeFees"
              value={inputs.includeFees}
              onChange={handleChange}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {inputs.includeFees === "yes" ? (
            <>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13 }}>Short-term fees (one-time)</label>
                <input
                  name="shortTermFees"
                  value={inputs.shortTermFees}
                  onChange={handleChange}
                  inputMode="decimal"
                  placeholder="e.g. 0"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13 }}>Annual policy fees (one-time)</label>
                <input
                  name="annualFees"
                  value={inputs.annualFees}
                  onChange={handleChange}
                  inputMode="decimal"
                  placeholder="e.g. 0"
                  style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
                />
              </div>
            </>
          ) : null}
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
      </form>

      {result ? (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>{result.cheaperOption}</div>

          <div style={{ fontSize: 14 }}>
            <strong>Coverage period:</strong> {fmt(result.coverageMonths)} months (~{fmt(result.coverageDays)} days)
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Short-term total:</strong> {fmt(result.shortTermTotal)}
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Annual (prorated) total:</strong> {fmt(result.annualProratedTotal)}
          </div>

          <div style={{ fontSize: 14 }}>
            <strong>Break-even duration:</strong>{" "}
            {result.breakEvenMonths === null ? "-" : `${fmt(result.breakEvenMonths)} months`}
          </div>

          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13, color: "#444" }}>
            {result.notes.map((n, i) => (
              <div key={i}>• {n}</div>
            ))}
          </div>

          <section style={{ marginTop: 8, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>How it works</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              We estimate the short-term cost over your coverage duration and compare it to an annual premium prorated
              by months. Break-even is where both totals become equal.
            </p>
          </section>

          <section style={{ marginTop: 4, display: "grid", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>FAQ</h2>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Why might annual be cheaper even for short periods?</strong>
              <div>Some annual plans effectively discount pricing, while short-term can have a higher per-day rate.</div>
            </div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              <strong>Does this include coverage differences?</strong>
              <div>No. It compares costs only. Always check exclusions, limits, and underwriting conditions.</div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
