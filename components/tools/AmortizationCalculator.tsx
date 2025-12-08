"use client";

import { useState } from "react";

type ScheduleRow = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

type Result = {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
  monthsToPayoff: number;
  schedule: ScheduleRow[];
};

export default function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [showFull, setShowFull] = useState(false);

  const handleCalculate = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(annualRate);
    const termYears = parseFloat(years);
    const extra = parseFloat(extraPayment || "0");

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

    const monthlyRate = rate / 100 / 12;
    const totalMonths = termYears * 12;

    // 기본 월 상환금 (추가 상환은 아래에서 별도 적용)
    const basePayment =
      (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -totalMonths));

    let balance = principal;
    let month = 0;
    let totalInterest = 0;
    const schedule: ScheduleRow[] = [];

    // extraPayment까지 반영해서 실제 스케줄 계산
    while (balance > 0 && month < 1000 * 12) {
      month += 1;
      const interest = balance * monthlyRate;
      let payment = basePayment + (extra || 0);

      if (payment > balance + interest) {
        payment = balance + interest;
      }

      const principalPaid = payment - interest;
      balance = balance - principalPaid;
      if (balance < 0.01) balance = 0;

      totalInterest += interest;

      schedule.push({
        month,
        payment,
        interest,
        principal: principalPaid,
        balance,
      });

      if (balance <= 0) break;
    }

    const totalPaid = principal + totalInterest;

    setResult({
      monthlyPayment: basePayment,
      totalInterest,
      totalPaid,
      monthsToPayoff: month,
      schedule,
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

  const visibleSchedule =
    result && (showFull ? result.schedule : result.schedule.slice(0, 12));

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Generate a full amortization schedule with monthly principal and
        interest breakdown. Optionally add an extra monthly payment to see
        how much faster you can pay off your loan.
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
            placeholder="300000"
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
          <span>Annual interest rate (%)</span>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            placeholder="6.0"
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
            placeholder="30"
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
          <span>Extra monthly payment (optional)</span>
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(e.target.value)}
            placeholder="200"
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
            Extra amount you plan to pay each month on top of the required payment.
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
        Calculate amortization
      </button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #eee",
              background: "#fafafa",
              fontSize: 14,
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            <p>
              <strong>Base monthly payment (no extra): </strong>
              {formatCurrency(result.monthlyPayment)}
            </p>
            <p>
              <strong>Estimated payoff time: </strong>
              {result.monthsToPayoff} months (
              {formatNumber(result.monthsToPayoff / 12, 1)} years)
            </p>
            <p>
              <strong>Total interest paid: </strong>
              {formatCurrency(result.totalInterest)}
            </p>
            <p>
              <strong>Total paid (principal + interest): </strong>
              {formatCurrency(result.totalPaid)}
            </p>
            <p style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
              This schedule assumes a fixed-rate loan with equal monthly
              payments. Actual lender terms and fees may vary.
            </p>
          </div>

          <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowFull(false)}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: showFull ? "1px solid #ddd" : "1px solid #0366d6",
                background: showFull ? "#fff" : "#0366d6",
                color: showFull ? "#333" : "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Show first 12 months
            </button>
            <button
              type="button"
              onClick={() => setShowFull(true)}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: showFull ? "1px solid #0366d6" : "1px solid #ddd",
                background: showFull ? "#0366d6" : "#fff",
                color: showFull ? "#fff" : "#333",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Show full schedule
            </button>
          </div>

          {visibleSchedule && (
            <div
              style={{
                maxHeight: showFull ? 360 : 260,
                overflow: "auto",
                borderRadius: 8,
                border: "1px solid #eee",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f5f5f5",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    <th
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                        textAlign: "right",
                      }}
                    >
                      Month
                    </th>
                    <th
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                        textAlign: "right",
                      }}
                    >
                      Payment
                    </th>
                    <th
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                        textAlign: "right",
                      }}
                    >
                      Interest
                    </th>
                    <th
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                        textAlign: "right",
                      }}
                    >
                      Principal
                    </th>
                    <th
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                        textAlign: "right",
                      }}
                    >
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSchedule.map((row) => (
                    <tr key={row.month}>
                      <td
                        style={{
                          padding: 6,
                          borderBottom: "1px solid #f0f0f0",
                          textAlign: "right",
                        }}
                      >
                        {row.month}
                      </td>
                      <td
                        style={{
                          padding: 6,
                          borderBottom: "1px solid #f0f0f0",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(row.payment)}
                      </td>
                      <td
                        style={{
                          padding: 6,
                          borderBottom: "1px solid #f0f0f0",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(row.interest)}
                      </td>
                      <td
                        style={{
                          padding: 6,
                          borderBottom: "1px solid #f0f0f0",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(row.principal)}
                      </td>
                      <td
                        style={{
                          padding: 6,
                          borderBottom: "1px solid #f0f0f0",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
