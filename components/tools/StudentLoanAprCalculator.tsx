// components/tools/StudentLoanAprCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type Result = {
  aprPct: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
};

function parseNumber(v: string) {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Payment for fixed-rate installment loan
function payment(principal: number, aprPct: number, years: number) {
  const n = years * 12;
  const r = aprPct / 100 / 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Estimate APR for a student loan by solving for the rate where the PV of payments equals net disbursed amount.
 *
 * Inputs:
 * - principal: loan amount (face amount / balance)
 * - termYears
 * - paymentAmount: monthly payment (optional; if not provided, use noteRate to compute payment)
 * - noteRate: nominal annual rate used to compute payment if monthly payment is not provided
 * - originationFeePct: % of principal deducted from disbursement (reduces amount received)
 * - upfrontFee: additional upfront fee paid (reduces amount received)
 *
 * Output:
 * - apr: the annual rate that equates payments to net amount received (IRR-ish, simplified)
 */
function estimateAprBisection(params: {
  principal: number;
  termYears: number;
  paymentAmount: number;
  netDisbursed: number;
}) {
  const { principal, termYears, paymentAmount, netDisbursed } = params;

  const n = termYears * 12;
  if (principal <= 0 || netDisbursed <= 0 || paymentAmount <= 0 || n <= 0) return 0;

  // Define f(r) = PV(payments at rate r) - netDisbursed
  const f = (annualRatePct: number) => {
    const r = annualRatePct / 100 / 12;
    if (r === 0) return paymentAmount * n - netDisbursed;
    const pv = paymentAmount * (1 - Math.pow(1 + r, -n)) / r;
    return pv - netDisbursed;
  };

  // Bisection bounds: 0%..200% APR (wide enough)
  let lo = 0;
  let hi = 200;

  // If f(0) already < 0, then payments PV at 0% is less than netDisbursed (shouldn't happen usually)
  // We'll still proceed.
  let flo = f(lo);
  let fhi = f(hi);

  // If signs are same, widen hi a bit (cap at 500)
  let guard = 0;
  while (flo * fhi > 0 && hi < 500 && guard < 20) {
    hi += 50;
    fhi = f(hi);
    guard += 1;
  }

  // If still no bracket, fallback to 0
  if (flo * fhi > 0) return 0;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const fmid = f(mid);
    if (Math.abs(fmid) < 1e-8) return mid;
    if (flo * fmid <= 0) {
      hi = mid;
      fhi = fmid;
    } else {
      lo = mid;
      flo = fmid;
    }
  }
  return (lo + hi) / 2;
}

export default function StudentLoanAprCalculator() {
  const [principal, setPrincipal] = useState<string>("");
  const [termYears, setTermYears] = useState<string>("10");

  // If user doesn't know payment, we can compute from note rate.
  const [noteRate, setNoteRate] = useState<string>("6.5");

  // Optional: user can input actual monthly payment (from servicer offer).
  const [monthlyPaymentInput, setMonthlyPaymentInput] = useState<string>("");

  // Fees affecting net disbursement
  const [originationFeePct, setOriginationFeePct] = useState<string>("1.0");
  const [upfrontFee, setUpfrontFee] = useState<string>("0");

  const [result, setResult] = useState<Result | null>(null);

  const derived = useMemo(() => {
    const P = parseNumber(principal);
    const years = parseNumber(termYears);
    const note = parseNumber(noteRate);
    const feePct = parseNumber(originationFeePct);
    const feeUpfront = parseNumber(upfrontFee);

    const origFeeAmount = P * (feePct / 100);
    const netDisbursed = Math.max(P - origFeeAmount - feeUpfront, 0);

    const paymentFromNote = payment(P, note, years);
    const paymentUser = parseNumber(monthlyPaymentInput);
    const usedPayment = paymentUser > 0 ? paymentUser : paymentFromNote;

    return {
      P,
      years,
      note,
      feePct,
      feeUpfront,
      origFeeAmount,
      netDisbursed,
      usedPayment,
      paymentFromNote,
    };
  }, [principal, termYears, noteRate, monthlyPaymentInput, originationFeePct, upfrontFee]);

  const handleCalculate = () => {
    const { P, years, usedPayment, netDisbursed } = derived;
    if (P <= 0 || years <= 0 || usedPayment <= 0 || netDisbursed <= 0) {
      setResult(null);
      return;
    }

    const apr = estimateAprBisection({
      principal: P,
      termYears: years,
      paymentAmount: usedPayment,
      netDisbursed,
    });

    const monthly = usedPayment;
    const totalPaid = monthly * years * 12;
    const totalInterest = totalPaid - P;

    setResult({
      aprPct: apr,
      monthlyPayment: monthly,
      totalPaid,
      totalInterest,
    });
  };

  const handleReset = () => {
    setPrincipal("");
    setTermYears("10");
    setNoteRate("6.5");
    setMonthlyPaymentInput("");
    setOriginationFeePct("1.0");
    setUpfrontFee("0");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate the <strong>APR</strong> of a student loan by accounting for fees that reduce the
        amount you actually receive (net disbursement). If you know your monthly payment from a
        servicer offer, enter it. Otherwise, we’ll estimate payment using the note rate.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Loan amount (principal)
          <input
            type="text"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 25000"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Term (years)
          <input
            type="text"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 10"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Note rate (APR, %) — used only if monthly payment is blank
          <input
            type="text"
            value={noteRate}
            onChange={(e) => setNoteRate(e.target.value)}
            placeholder="e.g. 6.5"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Monthly payment (optional)
          <input
            type="text"
            value={monthlyPaymentInput}
            onChange={(e) => setMonthlyPaymentInput(e.target.value)}
            placeholder="Leave blank to estimate from note rate"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
            If blank, estimated payment from note rate:{" "}
            <strong>{formatNumber(derived.paymentFromNote)}</strong>
          </div>
        </label>

        <label style={{ fontSize: 14 }}>
          Origination fee (% of principal)
          <input
            type="text"
            value={originationFeePct}
            onChange={(e) => setOriginationFeePct(e.target.value)}
            placeholder="e.g. 1.0"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ fontSize: 14 }}>
          Upfront fee (flat amount)
          <input
            type="text"
            value={upfrontFee}
            onChange={(e) => setUpfrontFee(e.target.value)}
            placeholder="e.g. 0"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </label>

        <div style={{ fontSize: 12, color: "#666" }}>
          Net disbursed (principal − fees):{" "}
          <strong>{formatNumber(derived.netDisbursed)}</strong>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={handleCalculate}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "none",
            background: "#0366d6",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Calculate APR
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#333",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            background: "#f5f8ff",
            border: "1px solid #d0ddff",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Estimated APR (fee-adjusted):</strong> {formatNumber(result.aprPct)}%
          </p>
          <p>
            <strong>Monthly payment used:</strong> {formatNumber(result.monthlyPayment)}
          </p>
          <p>
            <strong>Total repaid:</strong> {formatNumber(result.totalPaid)}
          </p>
          <p>
            <strong>Total interest (vs principal):</strong> {formatNumber(result.totalInterest)}
          </p>

          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            This APR estimate reflects fee impact via net disbursement. Actual lender APR math can
            differ slightly by rounding and timing assumptions, but this is a strong planning
            approximation for comparing offers.
          </p>
        </div>
      )}
    </div>
  );
}
