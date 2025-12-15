// components/tools/CreditCardAPRSavingsCalculator.tsx
"use client";

import { useMemo, useState, ChangeEvent, FormEvent } from "react";

type Mode = "fixedPayment" | "payoffMonths";

type Inputs = {
  balance: string; // $
  currentApr: string; // %
  newApr: string; // %
  mode: Mode;
  monthlyPayment: string; // used in fixedPayment
  payoffMonths: string; // used in payoffMonths
};

type SimResult = {
  months: number;
  totalInterest: number;
  totalPaid: number;
  paidOff: boolean;
};

type Result = {
  current: SimResult;
  next: SimResult;
  interestSavings: number;
  totalSavings: number;
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatNumber(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

// Simulate month-by-month.
// Assumption: interest accrues monthly on beginning-of-month balance (approx.)
// Payment is applied after interest is added.
// This is a practical approximation for consumer estimation tools.
function simulatePayoffFixedPayment(
  balance: number,
  aprPercent: number,
  monthlyPayment: number,
  maxMonths = 600
): SimResult {
  const r = aprPercent / 100 / 12; // monthly rate
  let b = balance;
  let totalInterest = 0;
  let totalPaid = 0;

  for (let m = 1; m <= maxMonths; m++) {
    const interest = b * r;
    totalInterest += interest;
    b = b + interest;

    const payment = Math.min(monthlyPayment, b);
    b -= payment;
    totalPaid += payment;

    if (b <= 0.0000001) {
      return { months: m, totalInterest, totalPaid, paidOff: true };
    }

    // If payment doesn't even cover interest, balance grows => no payoff
    if (monthlyPayment <= interest + 0.0000001) {
      return { months: m, totalInterest, totalPaid, paidOff: false };
    }
  }

  return { months: maxMonths, totalInterest, totalPaid, paidOff: false };
}

// Solve required monthly payment to payoff in N months for an amortizing balance.
// Payment = P * r / (1 - (1+r)^-n)
function paymentForPayoffMonths(balance: number, aprPercent: number, months: number): number {
  const r = aprPercent / 100 / 12;
  if (months <= 0) return NaN;

  if (r === 0) return balance / months;

  const denom = 1 - Math.pow(1 + r, -months);
  if (denom <= 0) return NaN;

  return (balance * r) / denom;
}

function simulatePayoffMonths(
  balance: number,
  aprPercent: number,
  months: number
): SimResult {
  const pmt = paymentForPayoffMonths(balance, aprPercent, months);

  if (!Number.isFinite(pmt) || pmt <= 0) {
    return { months, totalInterest: NaN, totalPaid: NaN, paidOff: false };
  }

  const sim = simulatePayoffFixedPayment(balance, aprPercent, pmt, months);

  // Force months to the chosen months for reporting consistency (approx)
  // If it pays off early due to rounding, still report the chosen months.
  const paidOff = sim.paidOff;
  const totalPaid = paidOff ? pmt * months : sim.totalPaid;
  const totalInterest = paidOff ? totalPaid - balance : sim.totalInterest;

  return { months, totalInterest, totalPaid, paidOff };
}

export default function CreditCardAPRSavingsCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    balance: "",
    currentApr: "",
    newApr: "",
    mode: "fixedPayment",
    monthlyPayment: "",
    payoffMonths: "24",
  });

  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modeLabel = useMemo(
    () => (inputs.mode === "fixedPayment" ? "Fixed Monthly Payment" : "Payoff in N Months"),
    [inputs.mode]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const balance = parseNumber(inputs.balance);
    const currentApr = parseNumber(inputs.currentApr);
    const newApr = parseNumber(inputs.newApr);

    if (!Number.isFinite(balance) || balance <= 0) {
      setError("Balance must be greater than 0.");
      return;
    }
    if (!Number.isFinite(currentApr) || currentApr < 0) {
      setError("Current APR must be a valid number (0 or greater).");
      return;
    }
    if (!Number.isFinite(newApr) || newApr < 0) {
      setError("New APR must be a valid number (0 or greater).");
      return;
    }

    let current: SimResult;
    let next: SimResult;

    if (inputs.mode === "fixedPayment") {
      const monthlyPayment = parseNumber(inputs.monthlyPayment);
      if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) {
        setError("Monthly payment must be greater than 0.");
        return;
      }

      current = simulatePayoffFixedPayment(balance, currentApr, monthlyPayment);
      next = simulatePayoffFixedPayment(balance, newApr, monthlyPayment);
    } else {
      const payoffMonths = parseNumber(inputs.payoffMonths);
      if (!Number.isFinite(payoffMonths) || payoffMonths <= 0) {
        setError("Payoff months must be greater than 0.");
        return;
      }

      current = simulatePayoffMonths(balance, currentApr, Math.round(payoffMonths));
      next = simulatePayoffMonths(balance, newApr, Math.round(payoffMonths));
    }

    const interestSavings = current.totalInterest - next.totalInterest;
    const totalSavings = current.totalPaid - next.totalPaid;

    setResult({
      current,
      next,
      interestSavings,
      totalSavings,
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
            <label style={{ fontSize: 13 }}>Credit card balance</label>
            <input
              name="balance"
              value={inputs.balance}
              onChange={handleChange}
              placeholder="e.g. 5000"
              inputMode="decimal"
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Current APR (%)</label>
              <input
                name="currentApr"
                value={inputs.currentApr}
                onChange={handleChange}
                placeholder="e.g. 24"
                inputMode="decimal"
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>New APR (%)</label>
              <input
                name="newApr"
                value={inputs.newApr}
                onChange={handleChange}
                placeholder="e.g. 18"
                inputMode="decimal"
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13 }}>Calculation mode</label>
            <select
              name="mode"
              value={inputs.mode}
              onChange={handleChange}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
                backgroundColor: "#fff",
              }}
            >
              <option value="fixedPayment">Fixed monthly payment</option>
              <option value="payoffMonths">Pay off in N months</option>
            </select>
          </div>

          {inputs.mode === "fixedPayment" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Monthly payment</label>
              <input
                name="monthlyPayment"
                value={inputs.monthlyPayment}
                onChange={handleChange}
                placeholder="e.g. 200"
                inputMode="decimal"
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13 }}>Payoff time (months)</label>
              <input
                name="payoffMonths"
                value={inputs.payoffMonths}
                onChange={handleChange}
                placeholder="e.g. 24"
                inputMode="numeric"
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #111",
              backgroundColor: "#111",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Calculate
          </button>

          {error && (
            <p style={{ color: "#b00020", fontSize: 13, margin: 0 }}>{error}</p>
          )}
        </div>
      </form>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #e1e4e8",
          padding: 16,
          backgroundColor: "#f6f8fa",
          minHeight: 200,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px 0" }}>
          Results ({modeLabel})
        </h3>

        {!result ? (
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
            Enter values and click Calculate.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ border: "1px solid #e1e4e8", borderRadius: 8, padding: 12, background: "#fff" }}>
                <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Current APR</div>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>Months</span>
                    <strong style={{ fontSize: 14 }}>{formatNumber(result.current.months, 0)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>Total interest</span>
                    <strong style={{ fontSize: 14 }}>${formatMoney(result.current.totalInterest)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>Total paid</span>
                    <strong style={{ fontSize: 14 }}>${formatMoney(result.current.totalPaid)}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: result.current.paidOff ? "#0a7" : "#b00020" }}>
                    {result.current.paidOff ? "Paid off within the simulation." : "May not pay off with these settings."}
                  </div>
                </div>
              </div>

              <div style={{ border: "1px solid #e1e4e8", borderRadius: 8, padding: 12, background: "#fff" }}>
                <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>New APR</div>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>Months</span>
                    <strong style={{ fontSize: 14 }}>{formatNumber(result.next.months, 0)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>Total interest</span>
                    <strong style={{ fontSize: 14 }}>${formatMoney(result.next.totalInterest)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>Total paid</span>
                    <strong style={{ fontSize: 14 }}>${formatMoney(result.next.totalPaid)}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: result.next.paidOff ? "#0a7" : "#b00020" }}>
                    {result.next.paidOff ? "Paid off within the simulation." : "May not pay off with these settings."}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ border: "1px solid #e1e4e8", borderRadius: 8, padding: 12, background: "#fff" }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "#555" }}>Estimated interest savings</span>
                  <strong style={{ fontSize: 14 }}>${formatMoney(result.interestSavings)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 13, color: "#555" }}>Estimated total paid savings</span>
                  <strong style={{ fontSize: 14 }}>${formatMoney(result.totalSavings)}</strong>
                </div>
                <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#333" }}>
                  Note: This is an estimate using monthly compounding assumptions. Exact card interest can vary by issuer and billing cycle.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
