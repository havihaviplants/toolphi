"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  netProfit: string; // $
  apply9235: boolean; // net earnings adjustment
  socialSecurityRate: string; // % (default 12.4)
  medicareRate: string; // % (default 2.9)
  wageBaseCap: string; // optional $ (e.g. 168600 for 2024; user-editable)
  wagesAlreadySS: string; // optional $ (W-2 wages already counted toward SS)
};

type Result = {
  netEarnings: number;
  ssTaxableEarnings: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalSETax: number;
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function money(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function SelfEmploymentTaxCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    netProfit: "",
    apply9235: true,
    socialSecurityRate: "12.4",
    medicareRate: "2.9",
    wageBaseCap: "",
    wagesAlreadySS: "",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const netProfit = parseNumber(inputs.netProfit);
    const ssRate = parseNumber(inputs.socialSecurityRate);
    const medicareRate = parseNumber(inputs.medicareRate);

    const wageBaseCap = inputs.wageBaseCap.trim()
      ? parseNumber(inputs.wageBaseCap)
      : NaN;

    const wagesAlreadySS = inputs.wagesAlreadySS.trim()
      ? parseNumber(inputs.wagesAlreadySS)
      : 0;

    if (!Number.isFinite(netProfit) || netProfit < 0) {
      setError("Net profit must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(ssRate) || ssRate < 0) {
      setError("Social Security rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(medicareRate) || medicareRate < 0) {
      setError("Medicare rate must be 0 or greater.");
      return;
    }
    if (Number.isFinite(wageBaseCap) && wageBaseCap < 0) {
      setError("Wage base cap must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(wagesAlreadySS) || wagesAlreadySS < 0) {
      setError("Wages already subject to Social Security must be 0 or greater.");
      return;
    }

    const netEarnings = inputs.apply9235 ? netProfit * 0.9235 : netProfit;

    // Social Security taxable earnings:
    // If cap provided, taxable is limited by (cap - wagesAlreadySS).
    // Otherwise, taxable = netEarnings (no cap applied).
    let ssTaxableEarnings = netEarnings;

    if (Number.isFinite(wageBaseCap)) {
      const remainingCap = Math.max(wageBaseCap - wagesAlreadySS, 0);
      ssTaxableEarnings = Math.min(netEarnings, remainingCap);
    }

    const socialSecurityTax = ssTaxableEarnings * (ssRate / 100);
    const medicareTax = netEarnings * (medicareRate / 100);
    const totalSETax = socialSecurityTax + medicareTax;

    setResult({
      netEarnings,
      ssTaxableEarnings,
      socialSecurityTax,
      medicareTax,
      totalSETax,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <label>Net profit (income - expenses)</label>
            <input
              name="netProfit"
              value={inputs.netProfit}
              onChange={handleChange}
              placeholder="e.g. 80000"
              inputMode="decimal"
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              name="apply9235"
              checked={inputs.apply9235}
              onChange={handleChange}
            />
            <label style={{ margin: 0 }}>
              Apply 92.35% net earnings adjustment (common IRS rule of thumb)
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 4 }}>
              <label>Social Security rate (%)</label>
              <input
                name="socialSecurityRate"
                value={inputs.socialSecurityRate}
                onChange={handleChange}
                placeholder="e.g. 12.4"
                inputMode="decimal"
              />
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              <label>Medicare rate (%)</label>
              <input
                name="medicareRate"
                value={inputs.medicareRate}
                onChange={handleChange}
                placeholder="e.g. 2.9"
                inputMode="decimal"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 4 }}>
              <label>Social Security wage base cap (optional)</label>
              <input
                name="wageBaseCap"
                value={inputs.wageBaseCap}
                onChange={handleChange}
                placeholder="e.g. 168600"
                inputMode="decimal"
              />
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              <label>Wages already subject to Social Security (optional)</label>
              <input
                name="wagesAlreadySS"
                value={inputs.wagesAlreadySS}
                onChange={handleChange}
                placeholder="e.g. 50000"
                inputMode="decimal"
              />
            </div>
          </div>

          <button type="submit">Calculate</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate self-employment tax.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Net earnings: <strong>${money(result.netEarnings)}</strong>
            </div>
            <div>
              Social Security taxable earnings:{" "}
              <strong>${money(result.ssTaxableEarnings)}</strong>
            </div>
            <div>
              Social Security tax:{" "}
              <strong>${money(result.socialSecurityTax)}</strong>
            </div>
            <div>
              Medicare tax: <strong>${money(result.medicareTax)}</strong>
            </div>
            <div>
              Total self-employment tax:{" "}
              <strong>${money(result.totalSETax)}</strong>
            </div>

            <p style={{ marginTop: 8, fontSize: 13, color: "#333" }}>
              Note: This is an estimate. Actual tax rules may vary (e.g., Additional Medicare Tax,
              deductions, filing status). This tool focuses on the basic SE tax components.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
