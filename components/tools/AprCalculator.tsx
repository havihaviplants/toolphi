"use client";

import { useState } from "react";

type Result = {
  monthlyPayment: number;
  nominalRate: number;
  aprPercent: number | null;
};

export default function AprCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [fees, setFees] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  // 월 상환금 계산 (명목 금리 기준)
  const calcMonthlyPayment = (
    principal: number,
    annualRate: number,
    years: number
  ) => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r <= 0) {
      return principal / n;
    }
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  };

  // 특정 월 이자율(r)에서 현가 계산
  const presentValueOfPayments = (
    payment: number,
    monthlyRate: number,
    months: number
  ) => {
    let pv = 0;
    for (let t = 1; t <= months; t++) {
      pv += payment / Math.pow(1 + monthlyRate, t);
    }
    return pv;
  };

  // 이분법으로 APR(월 이자율) 근사
  const solveAprMonthlyRate = (
    payment: number,
    amountFinanced: number,
    months: number
  ): number | null => {
    if (amountFinanced <= 0) return null;

    let low = 0;
    let high = 1; // 0~100% 월 이자율 (매우 넉넉한 상한)
    const target = amountFinanced;
    const maxIterations = 60;
    const tolerance = 1e-7;

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const pv = presentValueOfPayments(payment, mid, months);

      if (Math.abs(pv - target) < tolerance) {
        return mid;
      }

      if (pv > target) {
        // 할인율이 너무 낮음 → r를 올려야 PV 감소
        low = mid;
      } else {
        high = mid;
      }
    }

    return (low + high) / 2;
  };

  const handleCalculate = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(annualRate);
    const termYears = parseFloat(years);
    const feeValue = parseFloat(fees || "0");

    if (
      !isFinite(principal) ||
      principal <= 0 ||
      !isFinite(rate) ||
      rate <= 0 ||
      !isFinite(termYears) ||
      termYears <= 0
    ) {
      setResult(null);
      return;
    }

    const months = termYears * 12;
    const monthlyPayment = calcMonthlyPayment(principal, rate, termYears);

    // 수수료를 초기 현금 유출로 반영: 실제로 손에 쥐는 돈 = principal - fees
    const amountFinanced = principal - (feeValue > 0 ? feeValue : 0);

    let aprPercent: number | null = null;

    if (feeValue > 0 && amountFinanced > 0) {
      const aprMonthly = solveAprMonthlyRate(
        monthlyPayment,
        amountFinanced,
        months
      );
      if (aprMonthly !== null) {
        aprPercent = aprMonthly * 12 * 100;
      }
    } else {
      // 수수료가 없으면 APR ≈ 명목 금리
      aprPercent = rate;
    }

    setResult({
      monthlyPayment,
      nominalRate: rate,
      aprPercent,
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const formatNumber = (value: number, digits = 2) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: digits,
    });

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Estimate the annual percentage rate (APR) for a loan, taking both the
        interest rate and upfront fees into account. Use APR to compare loan
        offers on an apples-to-apples basis.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          <span>Loan amount (principal)</span>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="20000"
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
          <span>Nominal annual interest rate (%)</span>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="8.0"
            step="0.01"
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
          <span>Term (years)</span>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="5"
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
          <span>Upfront fees / closing costs</span>
          <input
            type="number"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            placeholder="600"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
          <span style={{ fontSize: 12, color: "#777" }}>
            Origination fees, points, closing costs, or other upfront charges.
          </span>
        </label>
      </div>

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

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #eee",
            background: "#fafafa",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <p>
            <strong>Monthly payment (based on nominal rate): </strong>
            {formatCurrency(result.monthlyPayment)}
          </p>
          <p>
            <strong>Nominal interest rate: </strong>
            {formatNumber(result.nominalRate)}%
          </p>
          {result.aprPercent !== null ? (
            <p>
              <strong>Estimated APR (incl. fees): </strong>
              {formatNumber(result.aprPercent)}%
            </p>
          ) : (
            <p>
              <strong>Estimated APR: </strong>
              Could not compute APR with the given inputs.
            </p>
          )}
          <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
            This APR estimate assumes fixed monthly payments and treats upfront
            fees as an initial cost at the start of the loan. Use it as a
            comparison tool, not as legal or lender-provided disclosure.
          </p>
        </div>
      )}
    </div>
  );
}
