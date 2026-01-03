"use client";

import React, { useMemo, useState, ChangeEvent, FormEvent } from "react";

type Inputs = {
  requestDate: string; // YYYY-MM-DD
  method: "card" | "bank" | "wallet" | "store-credit";
  merchantDays: string; // business days
  bankDays: string; // business days
  includeWeekends: boolean; // if true, treat as calendar days
};

type Result = {
  requestDate: Date;
  methodLabel: string;
  merchantDays: number;
  bankDays: number;
  processingComplete: Date;
  estimatedArrival: Date;
  totalDays: number;
};

function parseNonNegativeInt(value: string): number {
  const v = value.trim();
  if (!v) return NaN;
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  if (!Number.isInteger(n)) return NaN;
  return n;
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay(); // 0 Sun, 6 Sat
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return d;
}

function addCalendarDays(start: Date, days: number): Date {
  const d = new Date(start);
  d.setDate(d.getDate() + days);
  return d;
}

export default function RefundProcessingTimeEstimator() {
  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [inputs, setInputs] = useState<Inputs>({
    requestDate: todayStr,
    method: "card",
    merchantDays: "5",
    bankDays: "2",
    includeWeekends: false,
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const methodOptions: { value: Inputs["method"]; label: string; hint: string }[] = [
    { value: "card", label: "Credit/Debit Card", hint: "Often takes a few business days after the merchant approves." },
    { value: "bank", label: "Bank Transfer", hint: "Can be faster or slower depending on your bank posting time." },
    { value: "wallet", label: "Wallet (PayPal, etc.)", hint: "May post quickly once processed, but varies by provider." },
    { value: "store-credit", label: "Store Credit", hint: "Usually fastest. Often available the same day or next day." },
  ];

  const methodLabel = methodOptions.find((m) => m.value === inputs.method)?.label ?? "Refund";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setInputs((prev) => ({ ...prev, [name]: value } as Inputs));
  };

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInputs((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!inputs.requestDate) {
      setError("Please select a refund request date.");
      return;
    }

    const requestDate = new Date(`${inputs.requestDate}T00:00:00`);
    if (Number.isNaN(requestDate.getTime())) {
      setError("Request date is invalid.");
      return;
    }

    const merchantDays = parseNonNegativeInt(inputs.merchantDays);
    const bankDays = parseNonNegativeInt(inputs.bankDays);

    if (!Number.isFinite(merchantDays) || merchantDays < 0) {
      setError("Merchant processing days must be a whole number (0 or greater).");
      return;
    }
    if (!Number.isFinite(bankDays) || bankDays < 0) {
      setError("Bank posting days must be a whole number (0 or greater).");
      return;
    }

    // Store credit is usually near-immediate; still allow custom days for edge cases.
    const adder = inputs.includeWeekends ? addCalendarDays : addBusinessDays;

    const processingComplete = adder(requestDate, merchantDays);
    const estimatedArrival = adder(processingComplete, bankDays);
    const totalDays = merchantDays + bankDays;

    setResult({
      requestDate,
      methodLabel,
      merchantDays,
      bankDays,
      processingComplete,
      estimatedArrival,
      totalDays,
    });
  };

  const activeHint = methodOptions.find((m) => m.value === inputs.method)?.hint ?? "";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <h1 style={{ margin: 0 }}>Refund Processing Time Estimator</h1>
        <p style={{ margin: 0, color: "#444" }}>
          Estimate when your refund will arrive based on merchant processing time and bank posting delay.
        </p>
      </div>

      {/* Input Card */}
      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Refund request date</label>
              <input type="date" name="requestDate" value={inputs.requestDate} onChange={handleChange} />
              <div style={{ fontSize: 12, color: "#666" }}>
                Use the date you submitted the refund request (or when it was approved, if that’s the start point).
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Refund method</label>
              <select name="method" value={inputs.method} onChange={handleChange}>
                {methodOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 12, color: "#666" }}>{activeHint}</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <label>Merchant processing days</label>
                <input
                  name="merchantDays"
                  value={inputs.merchantDays}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  inputMode="numeric"
                />
                <div style={{ fontSize: 12, color: "#666" }}>How long the seller takes to process the refund.</div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Bank posting days</label>
                <input
                  name="bankDays"
                  value={inputs.bankDays}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  inputMode="numeric"
                />
                <div style={{ fontSize: 12, color: "#666" }}>Extra time for your bank/card to post the refund.</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 2 }}>
              <input
                id="includeWeekends"
                type="checkbox"
                name="includeWeekends"
                checked={inputs.includeWeekends}
                onChange={handleCheckbox}
              />
              <label htmlFor="includeWeekends" style={{ margin: 0 }}>
                Count weekends (use calendar days)
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
              <button type="submit">Calculate</button>
              <button
                type="button"
                onClick={() => {
                  setInputs({
                    requestDate: todayStr,
                    method: "card",
                    merchantDays: "5",
                    bankDays: "2",
                    includeWeekends: false,
                  });
                  setResult(null);
                  setError(null);
                }}
              >
                Reset
              </button>
            </div>

            {error && (
              <div style={{ border: "1px solid #ffd7d7", background: "#fff5f5", padding: 10, borderRadius: 10 }}>
                <p style={{ margin: 0, color: "#b00020" }}>{error}</p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Result Card */}
      <div style={{ border: "1px solid #e1e4e8", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Results</h2>

        {!result ? (
          <p style={{ margin: 0, color: "#444" }}>
            Enter your refund details and click <strong>Calculate</strong> to estimate the arrival date.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ color: "#444" }}>Summary</div>
              <div style={{ display: "grid", gap: 6 }}>
                <div>
                  Method: <strong>{result.methodLabel}</strong>
                </div>
                <div>
                  Merchant processing: <strong>{result.merchantDays}</strong> day(s)
                </div>
                <div>
                  Bank posting: <strong>{result.bankDays}</strong> day(s)
                </div>
                <div>
                  Total delay: <strong>{result.totalDays}</strong> day(s)
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 12, display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Processing completion date</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatDate(result.processingComplete)}</div>
              </div>

              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontSize: 12, color: "#666" }}>Estimated refund arrival date</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{formatDate(result.estimatedArrival)}</div>
              </div>
            </div>
          </div>
        )}

        <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
          Note: This is an estimate. Merchant processing and bank posting times vary by company and region.
        </p>
      </div>
    </div>
  );
}
