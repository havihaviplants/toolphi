// components/tools/PslfForgivenessEstimator.tsx
"use client";

import { useMemo, useState } from "react";

type Result = {
  remainingQualifyingPayments: number;
  monthsTo120: number;
  yearsTo120: number;

  estimatedRemainingPaid: number;
  estimatedForgivenAmount: number;

  estimatedFinalBalanceAt120: number;
};

function parseNumber(v: string) {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Standard fixed payment
function monthlyPayment(principal: number, aprPct: number, years: number) {
  const n = years * 12;
  const r = aprPct / 100 / 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Simulate balance after k months with fixed payment (no negative amortization here)
function simulateBalanceAfterMonths(params: {
  principal: number;
  aprPct: number;
  monthlyPayment: number;
  months: number;
}) {
  let bal = params.principal;
  const r = params.aprPct / 100 / 12;
  for (let i = 0; i < params.months; i++) {
    if (bal <= 0) return 0;
    const interest = bal * r;
    const principalPaid = Math.max(params.monthlyPayment - interest, 0);
    bal = Math.max(bal + interest - params.monthlyPayment, 0);

    // If payment doesn't cover interest (negative amortization), balance would grow.
    // We allow it (bal increases) by the formula above.
    // No extra clamp needed.
    void principalPaid;
  }
  return bal;
}

export default function PslfForgivenessEstimator() {
  // User inputs (kept general: works as a planning estimator, not “official”)
  const [currentBalance, setCurrentBalance] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("6.5");

  // Qualifying payments already made
  const [qualifyingPaymentsMade, setQualifyingPaymentsMade] = useState<string>("0");

  // IDR-like payment input (user enters expected monthly payment under a qualifying plan)
  const [monthlyQualifyingPayment, setMonthlyQualifyingPayment] = useState<string>("");

  // Optional: if user doesn't know qualifying payment, estimate a “standard” payment (not IDR)
  const [estimatePaymentYears, setEstimatePaymentYears] = useState<string>("10");
  const [useEstimatedPaymentIfBlank, setUseEstimatedPaymentIfBlank] = useState<boolean>(true);

  // Optional: assume annual payment growth (income increases, IDR payment increases)
  const [annualPaymentGrowthPct, setAnnualPaymentGrowthPct] = useState<string>("0");

  const [result, setResult] = useState<Result | null>(null);

  const derived = useMemo(() => {
    const bal = parseNumber(currentBalance);
    const apr = parseNumber(interestRate);
    const made = Math.max(0, Math.min(120, Math.floor(parseNumber(qualifyingPaymentsMade))));
    const growth = parseNumber(annualPaymentGrowthPct);

    const years = parseNumber(estimatePaymentYears);
    const estPay = monthlyPayment(bal, apr, years);

    const payInput = parseNumber(monthlyQualifyingPayment);
    const usedPay =
      payInput > 0 ? payInput : useEstimatedPaymentIfBlank ? estPay : 0;

    return { bal, apr, made, growth, estPay, usedPay };
  }, [
    currentBalance,
    interestRate,
    qualifyingPaymentsMade,
    annualPaymentGrowthPct,
    estimatePaymentYears,
    monthlyQualifyingPayment,
    useEstimatedPaymentIfBlank,
  ]);

  const handleCalculate = () => {
    const { bal, apr, made, growth, usedPay } = derived;

    if (bal <= 0 || apr < 0 || made < 0 || made > 120 || usedPay <= 0) {
      setResult(null);
      return;
    }

    const remaining = 120 - made;

    // Simulate remaining cost and balance at month 120.
    // We allow payment to grow annually by growth%.
    let totalPaid = 0;
    let payment = usedPay;
    let balance = bal;

    const r = apr / 100 / 12;

    for (let m = 1; m <= remaining; m++) {
      // Apply annual growth at month boundaries (every 12 months)
      if (growth !== 0 && m > 1 && (m - 1) % 12 === 0) {
        payment = payment * (1 + growth / 100);
      }

      const interest = balance * r;
      balance = balance + interest - payment;
      totalPaid += payment;

      // If fully paid off before 120, forgiveness is 0 thereafter
      if (balance <= 0) {
        balance = 0;
        // If it hits 0 early, the borrower would stop paying; but PSLF requires payments.
        // Realistically, PSLF would be irrelevant if balance is paid off.
        // We'll stop the loop for a clean estimate.
        break;
      }
    }

    const forgiven = balance; // estimated remaining balance at month 120
    const monthsTo120 = remaining;
    const yearsTo120 = remaining / 12;

    setResult({
      remainingQualifyingPayments: remaining,
      monthsTo120,
      yearsTo120,
      estimatedRemainingPaid: totalPaid,
      estimatedForgivenAmount: forgiven,
      estimatedFinalBalanceAt120: balance,
    });
  };

  const handleReset = () => {
    setCurrentBalance("");
    setInterestRate("6.5");
    setQualifyingPaymentsMade("0");
    setMonthlyQualifyingPayment("");
    setEstimatePaymentYears("10");
    setUseEstimatedPaymentIfBlank(true);
    setAnnualPaymentGrowthPct("0");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate potential <strong>PSLF (Public Service Loan Forgiveness)</strong> impact by
        projecting how many qualifying payments remain (up to 120) and estimating how much balance
        could be forgiven based on your expected qualifying monthly payment.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Current loan balance
          <input
            type="text"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            placeholder="e.g. 50000"
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
          Interest rate (APR %)
          <input
            type="text"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
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
          Qualifying payments already made (0–120)
          <input
            type="text"
            value={qualifyingPaymentsMade}
            onChange={(e) => setQualifyingPaymentsMade(e.target.value)}
            placeholder="e.g. 36"
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
          Expected qualifying monthly payment (IDR/qualifying plan)
          <input
            type="text"
            value={monthlyQualifyingPayment}
            onChange={(e) => setMonthlyQualifyingPayment(e.target.value)}
            placeholder="e.g. 250 (leave blank to estimate)"
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
            If blank, estimated payment (standard):{" "}
            <strong>{formatNumber(derived.estPay)}</strong>
          </div>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={useEstimatedPaymentIfBlank}
            onChange={(e) => {
              setUseEstimatedPaymentIfBlank(e.target.checked);
              setResult(null);
            }}
          />
          Use estimated payment if monthly payment is blank
        </label>

        <label style={{ fontSize: 14 }}>
          Standard payment estimate term (years) — used only for payment estimate
          <input
            type="text"
            value={estimatePaymentYears}
            onChange={(e) => setEstimatePaymentYears(e.target.value)}
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
          Annual payment growth (optional, % per year)
          <input
            type="text"
            value={annualPaymentGrowthPct}
            onChange={(e) => setAnnualPaymentGrowthPct(e.target.value)}
            placeholder="e.g. 3 (if income/payment grows)"
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
          Estimate PSLF forgiveness
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
            <strong>Remaining qualifying payments:</strong> {result.remainingQualifyingPayments}
          </p>
          <p>
            <strong>Time to 120 payments:</strong> {result.monthsTo120} months (
            {formatNumber(result.yearsTo120)} years)
          </p>

          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #d0ddff" }} />

          <p>
            <strong>Estimated remaining paid until 120:</strong>{" "}
            {formatNumber(result.estimatedRemainingPaid)}
          </p>
          <p>
            <strong>Estimated balance forgiven at 120:</strong>{" "}
            {formatNumber(result.estimatedForgivenAmount)}
          </p>

          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            This is a planning estimate only. Real PSLF eligibility depends on loan type, employer,
            qualifying repayment plan, and certification. Use your servicer’s official tools for
            final verification.
          </p>
        </div>
      )}
    </div>
  );
}
