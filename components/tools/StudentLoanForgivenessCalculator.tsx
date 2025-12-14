// components/tools/StudentLoanForgivenessCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type Result = {
  monthsRemaining: number;
  yearsRemaining: number;

  totalPaidUntilForgiveness: number;
  remainingBalanceAtForgiveness: number;

  estimatedForgivenAmount: number;
};

function parseNumber(v: string) {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Standard fixed payment (used for optional estimate)
function standardMonthlyPayment(principal: number, aprPct: number, years: number) {
  const n = years * 12;
  const r = aprPct / 100 / 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function StudentLoanForgivenessCalculator() {
  const [currentBalance, setCurrentBalance] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("6.5");

  // Forgiveness timeline inputs
  const [monthsUntilForgiveness, setMonthsUntilForgiveness] = useState<string>("240"); // e.g., 20 years

  // Payment inputs: user can enter expected monthly payment (IDR), or estimate with a "standard" term
  const [expectedMonthlyPayment, setExpectedMonthlyPayment] = useState<string>("");

  const [estimateTermYears, setEstimateTermYears] = useState<string>("10");
  const [useEstimatedIfBlank, setUseEstimatedIfBlank] = useState<boolean>(true);

  // Optional: annual payment growth for IDR
  const [annualPaymentGrowthPct, setAnnualPaymentGrowthPct] = useState<string>("0");

  // Optional: forgiveness may be taxable (varies by jurisdiction/period)
  const [assumeTaxableForgiveness, setAssumeTaxableForgiveness] = useState<boolean>(false);
  const [taxRatePct, setTaxRatePct] = useState<string>("22");

  const [result, setResult] = useState<Result | null>(null);

  const derived = useMemo(() => {
    const bal = parseNumber(currentBalance);
    const apr = parseNumber(interestRate);

    const months = Math.max(0, Math.floor(parseNumber(monthsUntilForgiveness)));
    const growth = parseNumber(annualPaymentGrowthPct);

    const estYears = parseNumber(estimateTermYears);
    const estPay = standardMonthlyPayment(bal, apr, estYears);

    const payInput = parseNumber(expectedMonthlyPayment);
    const usedPay = payInput > 0 ? payInput : useEstimatedIfBlank ? estPay : 0;

    const taxRate = parseNumber(taxRatePct);

    return { bal, apr, months, growth, estPay, usedPay, taxRate };
  }, [
    currentBalance,
    interestRate,
    monthsUntilForgiveness,
    annualPaymentGrowthPct,
    estimateTermYears,
    expectedMonthlyPayment,
    useEstimatedIfBlank,
    taxRatePct,
  ]);

  const handleCalculate = () => {
    const { bal, apr, months, growth, usedPay } = derived;

    if (bal <= 0 || months <= 0 || usedPay <= 0) {
      setResult(null);
      return;
    }

    let balance = bal;
    let payment = usedPay;
    let totalPaid = 0;

    const r = apr / 100 / 12;

    for (let m = 1; m <= months; m++) {
      // Apply annual growth at the start of each new year (month 13, 25, ...)
      if (growth !== 0 && m > 1 && (m - 1) % 12 === 0) {
        payment = payment * (1 + growth / 100);
      }

      const interest = balance * r;
      balance = balance + interest - payment;
      totalPaid += payment;

      // If fully repaid before forgiveness month, forgiveness becomes 0
      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    const forgiven = balance;

    setResult({
      monthsRemaining: months,
      yearsRemaining: months / 12,
      totalPaidUntilForgiveness: totalPaid,
      remainingBalanceAtForgiveness: balance,
      estimatedForgivenAmount: forgiven,
    });
  };

  const taxInfo = useMemo(() => {
    if (!result) return null;
    if (!assumeTaxableForgiveness) return null;
    const taxRate = derived.taxRate;
    if (taxRate <= 0) return null;
    const estTax = (result.estimatedForgivenAmount * taxRate) / 100;
    return { estTax, taxRate };
  }, [result, assumeTaxableForgiveness, derived.taxRate]);

  const handleReset = () => {
    setCurrentBalance("");
    setInterestRate("6.5");
    setMonthsUntilForgiveness("240");
    setExpectedMonthlyPayment("");
    setEstimateTermYears("10");
    setUseEstimatedIfBlank(true);
    setAnnualPaymentGrowthPct("0");
    setAssumeTaxableForgiveness(false);
    setTaxRatePct("22");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate how much student loan balance could remain (and potentially be{" "}
        <strong>forgiven</strong>) after a set number of months, based on your expected monthly
        payment. This is useful for planning around general forgiveness timelines (e.g., 20–25
        years) and repayment scenarios.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Current loan balance
          <input
            type="text"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            placeholder="e.g. 60000"
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
          Months until forgiveness (timeline)
          <input
            type="text"
            value={monthsUntilForgiveness}
            onChange={(e) => setMonthsUntilForgiveness(e.target.value)}
            placeholder="e.g. 240 (20 years)"
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
            Common timelines: 240 months (20 years), 300 months (25 years)
          </div>
        </label>

        <label style={{ fontSize: 14 }}>
          Expected monthly payment (IDR or other)
          <input
            type="text"
            value={expectedMonthlyPayment}
            onChange={(e) => setExpectedMonthlyPayment(e.target.value)}
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
            checked={useEstimatedIfBlank}
            onChange={(e) => {
              setUseEstimatedIfBlank(e.target.checked);
              setResult(null);
            }}
          />
          Use estimated payment if monthly payment is blank
        </label>

        <label style={{ fontSize: 14 }}>
          Standard payment estimate term (years) — only for estimation
          <input
            type="text"
            value={estimateTermYears}
            onChange={(e) => setEstimateTermYears(e.target.value)}
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
            placeholder="e.g. 3"
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

        <div
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #eee",
            background: "#fafafa",
          }}
        >
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={assumeTaxableForgiveness}
              onChange={(e) => setAssumeTaxableForgiveness(e.target.checked)}
            />
            Assume forgiven amount is taxable (optional estimate)
          </label>

          {assumeTaxableForgiveness && (
            <label style={{ fontSize: 14, marginTop: 10, display: "block" }}>
              Tax rate (%)
              <input
                type="text"
                value={taxRatePct}
                onChange={(e) => setTaxRatePct(e.target.value)}
                placeholder="e.g. 22"
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
          )}

          <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Tax treatment varies by program, country, and year. This is a planning estimate only.
          </p>
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
          Estimate forgiveness
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
            <strong>Timeline:</strong> {result.monthsRemaining} months (
            {formatNumber(result.yearsRemaining)} years)
          </p>

          <p>
            <strong>Total paid until forgiveness:</strong>{" "}
            {formatNumber(result.totalPaidUntilForgiveness)}
          </p>

          <p>
            <strong>Estimated remaining balance at forgiveness:</strong>{" "}
            {formatNumber(result.remainingBalanceAtForgiveness)}
          </p>

          <p>
            <strong>Estimated forgiven amount:</strong>{" "}
            {formatNumber(result.estimatedForgivenAmount)}
          </p>

          {taxInfo && (
            <p style={{ marginTop: 10 }}>
              <strong>Estimated tax on forgiven amount ({formatNumber(taxInfo.taxRate)}%):</strong>{" "}
              {formatNumber(taxInfo.estTax)}
            </p>
          )}

          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            This is a simplified projection. Real forgiveness depends on program rules, plan
            qualification, recertification, and servicer calculations.
          </p>
        </div>
      )}
    </div>
  );
}
