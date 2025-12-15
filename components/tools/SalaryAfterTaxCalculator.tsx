"use client";

import { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  grossAnnualSalary: string; // $
  pretaxDeductions: string; // $
  federalTaxRate: string; // %
  stateTaxRate: string; // % optional (can be 0)
  includeFICA: boolean;
  socialSecurityRate: string; // % default 6.2
  medicareRate: string; // % default 1.45
  ssWageBaseCap: string; // optional cap for SS wage base
};

type Result = {
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
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

export default function SalaryAfterTaxCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    grossAnnualSalary: "",
    pretaxDeductions: "",
    federalTaxRate: "",
    stateTaxRate: "",
    includeFICA: true,
    socialSecurityRate: "6.2",
    medicareRate: "1.45",
    ssWageBaseCap: "",
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

    const grossAnnualSalary = parseNumber(inputs.grossAnnualSalary);
    const pretaxDeductions = inputs.pretaxDeductions.trim()
      ? parseNumber(inputs.pretaxDeductions)
      : 0;

    const federalTaxRate = parseNumber(inputs.federalTaxRate);
    const stateTaxRate = inputs.stateTaxRate.trim()
      ? parseNumber(inputs.stateTaxRate)
      : 0;

    const ssRate = parseNumber(inputs.socialSecurityRate);
    const medicareRate = parseNumber(inputs.medicareRate);

    const ssWageBaseCap = inputs.ssWageBaseCap.trim()
      ? parseNumber(inputs.ssWageBaseCap)
      : NaN;

    if (!Number.isFinite(grossAnnualSalary) || grossAnnualSalary < 0) {
      setError("Gross annual salary must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(pretaxDeductions) || pretaxDeductions < 0) {
      setError("Pre-tax deductions must be 0 or greater.");
      return;
    }
    if (pretaxDeductions > grossAnnualSalary) {
      setError("Pre-tax deductions cannot exceed gross salary.");
      return;
    }
    if (!Number.isFinite(federalTaxRate) || federalTaxRate < 0) {
      setError("Federal tax rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(stateTaxRate) || stateTaxRate < 0) {
      setError("State tax rate must be 0 or greater.");
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
    if (Number.isFinite(ssWageBaseCap) && ssWageBaseCap < 0) {
      setError("Social Security wage base cap must be 0 or greater.");
      return;
    }

    const taxableIncome = Math.max(grossAnnualSalary - pretaxDeductions, 0);

    const federalTax = taxableIncome * (federalTaxRate / 100);
    const stateTax = taxableIncome * (stateTaxRate / 100);

    let socialSecurityTax = 0;
    let medicareTaxValue = 0;

    if (inputs.includeFICA) {
      const ssTaxable = Number.isFinite(ssWageBaseCap)
        ? Math.min(taxableIncome, ssWageBaseCap)
        : taxableIncome;

      socialSecurityTax = ssTaxable * (ssRate / 100);
      medicareTaxValue = taxableIncome * (medicareRate / 100);
    }

    const totalTax = federalTax + stateTax + socialSecurityTax + medicareTaxValue;
    const netAnnual = taxableIncome - totalTax;
    const netMonthly = netAnnual / 12;

    setResult({
      taxableIncome,
      federalTax,
      stateTax,
      socialSecurityTax,
      medicareTax: medicareTaxValue,
      totalTax,
      netAnnual,
      netMonthly,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <label>Gross annual salary</label>
            <input
              name="grossAnnualSalary"
              value={inputs.grossAnnualSalary}
              onChange={handleChange}
              placeholder="e.g. 100000"
              inputMode="decimal"
            />
          </div>

          <div style={{ display: "grid", gap: 4 }}>
            <label>Pre-tax deductions (optional)</label>
            <input
              name="pretaxDeductions"
              value={inputs.pretaxDeductions}
              onChange={handleChange}
              placeholder="e.g. 10000"
              inputMode="decimal"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 4 }}>
              <label>Federal tax rate (%)</label>
              <input
                name="federalTaxRate"
                value={inputs.federalTaxRate}
                onChange={handleChange}
                placeholder="e.g. 18"
                inputMode="decimal"
              />
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              <label>State tax rate (%) (optional)</label>
              <input
                name="stateTaxRate"
                value={inputs.stateTaxRate}
                onChange={handleChange}
                placeholder="e.g. 5"
                inputMode="decimal"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              name="includeFICA"
              checked={inputs.includeFICA}
              onChange={handleChange}
            />
            <label style={{ margin: 0 }}>Include FICA (Social Security + Medicare)</label>
          </div>

          {inputs.includeFICA && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <label>Social Security rate (%)</label>
                  <input
                    name="socialSecurityRate"
                    value={inputs.socialSecurityRate}
                    onChange={handleChange}
                    placeholder="e.g. 6.2"
                    inputMode="decimal"
                  />
                </div>

                <div style={{ display: "grid", gap: 4 }}>
                  <label>Medicare rate (%)</label>
                  <input
                    name="medicareRate"
                    value={inputs.medicareRate}
                    onChange={handleChange}
                    placeholder="e.g. 1.45"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: 4 }}>
                <label>Social Security wage base cap (optional)</label>
                <input
                  name="ssWageBaseCap"
                  value={inputs.ssWageBaseCap}
                  onChange={handleChange}
                  placeholder="e.g. 168600"
                  inputMode="decimal"
                />
              </div>
            </>
          )}

          <button type="submit">Calculate</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate after-tax salary.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Taxable income: <strong>${money(result.taxableIncome)}</strong>
            </div>
            <div>
              Federal tax: <strong>${money(result.federalTax)}</strong>
            </div>
            <div>
              State tax: <strong>${money(result.stateTax)}</strong>
            </div>
            <div>
              Social Security tax: <strong>${money(result.socialSecurityTax)}</strong>
            </div>
            <div>
              Medicare tax: <strong>${money(result.medicareTax)}</strong>
            </div>
            <div>
              Total tax: <strong>${money(result.totalTax)}</strong>
            </div>
            <div>
              Net annual (take-home): <strong>${money(result.netAnnual)}</strong>
            </div>
            <div>
              Net monthly (take-home): <strong>${money(result.netMonthly)}</strong>
            </div>

            <p style={{ marginTop: 8, fontSize: 13, color: "#333" }}>
              Note: This is a simplified estimator (flat rates). Actual tax depends on brackets,
              deductions, credits, filing status, and location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
