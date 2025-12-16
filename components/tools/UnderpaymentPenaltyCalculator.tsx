"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  unpaidTax: string;     // $
  annualRate: string;   // %
  daysUnderpaid: string;
};

type Result = {
  unpaidTax: number;
  annualRate: number;
  daysUnderpaid: number;
  penalty: number;
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

export default function UnderpaymentPenaltyCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    unpaidTax: "",
    annualRate: "",
    daysUnderpaid: "",
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

    const unpaidTax = parseNumber(inputs.unpaidTax);
    const annualRate = parseNumber(inputs.annualRate);
    const daysUnderpaid = parseNumber(inputs.daysUnderpaid);

    if (!Number.isFinite(unpaidTax) || unpaidTax < 0) {
      setError("Unpaid tax amount must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(annualRate) || annualRate < 0) {
      setError("Annual penalty rate must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(daysUnderpaid) || daysUnderpaid < 0) {
      setError("Days underpaid must be 0 or greater.");
      return;
    }

    // Simple daily interest approximation
    const dailyRate = annualRate / 100 / 365;
    const penalty = unpaidTax * dailyRate * daysUnderpaid;

    setResult({
      unpaidTax,
      annualRate,
      daysUnderpaid,
      penalty,
    });
  };

  return (
    <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Unpaid tax amount</label>
            <input
              name="unpaidTax"
              value={inputs.unpaidTax}
              onChange={handleChange}
              placeholder="e.g. 5000"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Annual penalty / interest rate (%)</label>
            <input
              name="annualRate"
              value={inputs.annualRate}
              onChange={handleChange}
              placeholder="e.g. 7"
              inputMode="decimal"
            />
          </div>

          <div>
            <label>Days underpaid</label>
            <input
              name="daysUnderpaid"
              value={inputs.daysUnderpaid}
              onChange={handleChange}
              placeholder="e.g. 120"
              inputMode="decimal"
            />
          </div>

          <button type="submit">Calculate</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        {!result ? (
          <p>Enter values to estimate underpayment penalty.</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <div>
              Unpaid tax: <strong>${money(result.unpaidTax)}</strong>
            </div>
            <div>
              Days underpaid: <strong>{result.daysUnderpaid}</strong>
            </div>
            <div>
              Estimated penalty: <strong>${money(result.penalty)}</strong>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
        Note: This is a simplified daily-interest estimate. Actual IRS penalties may vary by quarter,
        rate changes, and safe-harbor rules.
      </p>
    </div>
  );
}
