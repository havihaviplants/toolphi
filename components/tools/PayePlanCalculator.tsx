// components/tools/PayePlanCalculator.tsx
"use client";

import { useMemo, useState } from "react";

type Result = {
  discretionaryIncomeAnnual: number;
  discretionaryIncomeMonthly: number;

  monthlyPayment: number;
  annualPayment: number;

  estimatedMonthlyInterest: number;
  interestCoverage: "covers_interest" | "does_not_cover_interest";
};

function parseNumber(v: string) {
  const n = Number(v.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// PAYE (simplified estimator):
// - Discretionary income ≈ AGI - 150% of poverty guideline
// - Payment ≈ 10% of discretionary income / 12
// Real PAYE includes additional rules (partial financial hardship, payment cap vs Standard 10-year, etc.).
// This tool is intentionally a planning estimator and keeps inputs editable.

export default function PayePlanCalculator() {
  const [agi, setAgi] = useState<string>("");
  const [familySize, setFamilySize] = useState<string>("1");

  // User-editable poverty guideline baseline
  const [povertyGuidelineAnnual, setPovertyGuidelineAnnual] = useState<string>("15060");
  const [povertyMultiplierPct, setPovertyMultiplierPct] = useState<string>("150");

  // PAYE % of discretionary income (usually 10%)
  const [paymentPctOfDiscretionary, setPaymentPctOfDiscretionary] = useState<string>("10");

  // Optional: loan interest check
  const [loanBalance, setLoanBalance] = useState<string>("");
  const [loanApr, setLoanApr] = useState<string>("6.5");

  const [result, setResult] = useState<Result | null>(null);

  const derived = useMemo(() => {
    const a = parseNumber(agi);
    const fs = Math.max(1, Math.floor(parseNumber(familySize)));
    const basePoverty = parseNumber(povertyGuidelineAnnual);

    const mult = parseNumber(povertyMultiplierPct);
    const payPct = parseNumber(paymentPctOfDiscretionary);

    const bal = parseNumber(loanBalance);
    const apr = parseNumber(loanApr);

    // Minimal family-size adjustment (editable guideline recommended for accuracy)
    const povertyForFamily = basePoverty + Math.max(0, fs - 1) * (basePoverty * 0.35);

    const threshold = povertyForFamily * (mult / 100);
    const discretionaryAnnual = Math.max(0, a - threshold);
    const discretionaryMonthly = discretionaryAnnual / 12;

    const monthlyPay = (discretionaryMonthly * payPct) / 100;
    const annualPay = monthlyPay * 12;

    const monthlyInterest = bal > 0 ? (bal * (apr / 100)) / 12 : 0;

    return {
      fs,
      povertyForFamily,
      threshold,
      discretionaryAnnual,
      discretionaryMonthly,
      monthlyPay,
      annualPay,
      monthlyInterest,
    };
  }, [
    agi,
    familySize,
    povertyGuidelineAnnual,
    povertyMultiplierPct,
    paymentPctOfDiscretionary,
    loanBalance,
    loanApr,
  ]);

  const handleCalculate = () => {
    if (parseNumber(agi) <= 0) {
      setResult(null);
      return;
    }

    const status =
      derived.monthlyPay >= derived.monthlyInterest
        ? "covers_interest"
        : "does_not_cover_interest";

    setResult({
      discretionaryIncomeAnnual: derived.discretionaryAnnual,
      discretionaryIncomeMonthly: derived.discretionaryMonthly,
      monthlyPayment: derived.monthlyPay,
      annualPayment: derived.annualPay,
      estimatedMonthlyInterest: derived.monthlyInterest,
      interestCoverage: status,
    });
  };

  const handleReset = () => {
    setAgi("");
    setFamilySize("1");
    setPovertyGuidelineAnnual("15060");
    setPovertyMultiplierPct("150");
    setPaymentPctOfDiscretionary("10");
    setLoanBalance("");
    setLoanApr("6.5");
    setResult(null);
  };

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Estimate your student loan payment under a simplified <strong>PAYE</strong> model using
        discretionary income assumptions. This is a planning estimate — official PAYE eligibility,
        payment caps, and servicer calculations may differ.
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>
          Adjusted Gross Income (AGI) — annual
          <input
            type="text"
            value={agi}
            onChange={(e) => setAgi(e.target.value)}
            placeholder="e.g. 55000"
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
          Family size
          <input
            type="text"
            value={familySize}
            onChange={(e) => setFamilySize(e.target.value)}
            placeholder="e.g. 1"
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
            Best accuracy: paste the poverty guideline for your family size/location.
          </div>
        </label>

        <label style={{ fontSize: 14 }}>
          Poverty guideline (annual) — baseline (editable)
          <input
            type="text"
            value={povertyGuidelineAnnual}
            onChange={(e) => setPovertyGuidelineAnnual(e.target.value)}
            placeholder="e.g. 15060"
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label style={{ fontSize: 14 }}>
            Discretionary threshold multiplier (%)
            <input
              type="text"
              value={povertyMultiplierPct}
              onChange={(e) => setPovertyMultiplierPct(e.target.value)}
              placeholder="e.g. 150"
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
            Payment rate (% of discretionary income)
            <input
              type="text"
              value={paymentPctOfDiscretionary}
              onChange={(e) => setPaymentPctOfDiscretionary(e.target.value)}
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
        </div>

        <div
          style={{
            padding: 10,
            border: "1px solid #eee",
            borderRadius: 6,
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
            Optional: loan interest check
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ fontSize: 14 }}>
              Loan balance
              <input
                type="text"
                value={loanBalance}
                onChange={(e) => setLoanBalance(e.target.value)}
                placeholder="e.g. 45000"
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
              Loan APR (%)
              <input
                type="text"
                value={loanApr}
                onChange={(e) => setLoanApr(e.target.value)}
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
          </div>

          <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Checks whether the estimated PAYE payment likely covers monthly interest (approx).
          </p>
        </div>

        <div style={{ padding: 10, borderRadius: 6, border: "1px solid #eee" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Quick preview:</div>
          <div style={{ marginTop: 6, fontSize: 13 }}>
            Estimated poverty guideline (family-adjusted):{" "}
            <strong>{formatNumber(derived.povertyForFamily)}</strong>
          </div>
          <div style={{ marginTop: 4, fontSize: 13 }}>
            Discretionary threshold: <strong>{formatNumber(derived.threshold)}</strong>
          </div>
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
          Estimate PAYE payment
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
            <strong>Discretionary income (annual):</strong>{" "}
            {formatNumber(result.discretionaryIncomeAnnual)}
          </p>
          <p>
            <strong>Discretionary income (monthly):</strong>{" "}
            {formatNumber(result.discretionaryIncomeMonthly)}
          </p>

          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #d0ddff" }} />

          <p>
            <strong>Estimated PAYE monthly payment:</strong>{" "}
            {formatNumber(result.monthlyPayment)}
          </p>
          <p>
            <strong>Estimated PAYE annual payment:</strong>{" "}
            {formatNumber(result.annualPayment)}
          </p>

          {result.estimatedMonthlyInterest > 0 && (
            <>
              <hr
                style={{ margin: "12px 0", border: "none", borderTop: "1px solid #d0ddff" }}
              />
              <p>
                <strong>Estimated monthly interest:</strong>{" "}
                {formatNumber(result.estimatedMonthlyInterest)}
              </p>
              <p>
                <strong>Interest coverage:</strong>{" "}
                {result.interestCoverage === "covers_interest"
                  ? "Estimated payment covers interest"
                  : "Estimated payment may not cover interest"}
              </p>
            </>
          )}

          <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            PAYE has additional rules (eligibility, payment caps vs 10-year standard, etc.). Use
            this for planning, then verify with official servicer calculators.
          </p>
        </div>
      )}
    </div>
  );
}
