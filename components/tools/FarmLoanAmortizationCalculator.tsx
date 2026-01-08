"use client";

import { useState } from "react";

type Row = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export default function FarmLoanAmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [apr, setApr] = useState("");
  const [termYears, setTermYears] = useState("");
  const [schedule, setSchedule] = useState<Row[]>([]);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const format = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const calculate = () => {
    const P = parseNumber(loanAmount);
    const r = parseNumber(apr) / 100 / 12;
    const n = parseNumber(termYears) * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      setSchedule([]);
      setMonthlyPayment(null);
      setTotalInterest(null);
      return;
    }

    const payment =
      (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    let balance = P;
    let totalInt = 0;
    const rows: Row[] = [];

    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = payment - interest;
      balance -= principal;
      totalInt += interest;

      rows.push({
        month: i,
        payment,
        principal,
        interest,
        balance: balance < 0 ? 0 : balance,
      });
    }

    setMonthlyPayment(payment);
    setTotalInterest(totalInt);
    setSchedule(rows);
  };

  return (
    <div>
      {/* Intro */}
      <p style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
        This farm loan amortization calculator shows how each payment is split
        between principal and interest over time. It helps farm owners
        understand long-term borrowing costs and cash flow impact.
      </p>

      {/* Inputs */}
      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <label>
          Loan amount
          <div style={{ fontSize: 12, color: "#777" }}>
            Total farm loan principal
          </div>
          <input
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 200000"
            style={inputStyle}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={{ fontSize: 12, color: "#777" }}>
            Fixed annual interest rate
          </div>
          <input
            type="text"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 5.5"
            style={inputStyle}
          />
        </label>

        <label>
          Loan term (years)
          <div style={{ fontSize: 12, color: "#777" }}>
            Total repayment period
          </div>
          <input
            type="text"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 20"
            style={inputStyle}
          />
        </label>
      </div>

      <button onClick={calculate} style={buttonStyle}>
        Calculate amortization
      </button>

      {/* Summary */}
      {monthlyPayment && totalInterest && (
        <div style={summaryBox}>
          <p>
            <strong>Monthly payment:</strong> {format(monthlyPayment)}
          </p>
          <p>
            <strong>Total interest paid:</strong> {format(totalInterest)}
          </p>
        </div>
      )}

      {/* Amortization Table */}
      {schedule.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Amortization schedule</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Payment</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Remaining balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.slice(0, 24).map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{format(row.payment)}</td>
                    <td>{format(row.principal)}</td>
                    <td>{format(row.interest)}</td>
                    <td>{format(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Showing first 24 months. Full schedule follows the same pattern.
          </p>
        </>
      )}

      {/* How it works */}
      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Monthly interest rate = APR ÷ 12</li>
        <li>Total payments = loan term × 12 months</li>
        <li>Each payment is split between interest and principal</li>
        <li>Interest decreases over time as the balance is reduced</li>
      </ul>

      {/* Assumptions */}
      <h3>Assumptions & notes</h3>
      <ul>
        <li>Fixed interest rate (not variable)</li>
        <li>Principal + interest only</li>
        <li>Does not include taxes, insurance, or fees</li>
        <li>Actual lender terms may differ</li>
      </ul>

      {/* FAQ */}
      <h3>Frequently asked questions</h3>
      <p><strong>Why is more interest paid early in the loan?</strong><br />
        Interest is calculated on the remaining balance, which is highest at
        the beginning of the loan.</p>

      <p><strong>Can this be used for USDA or FSA farm loans?</strong><br />
        Yes. The amortization math is the same, though rates and terms may vary.</p>

      <p><strong>Does making extra payments reduce interest?</strong><br />
        Yes. Extra principal payments reduce the balance and total interest.</p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  padding: "9px 14px",
  borderRadius: 6,
  border: "none",
  background: "#0366d6",
  color: "#fff",
  fontSize: 14,
  cursor: "pointer",
};

const summaryBox: React.CSSProperties = {
  marginTop: 18,
  padding: 14,
  borderRadius: 8,
  background: "#f5f8ff",
  border: "1px solid #d0ddff",
  fontSize: 14,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 12,
  fontSize: 13,
};
