"use client";

import { useState } from "react";

type Row = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export default function FarmlandLoanAmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [apr, setApr] = useState("");
  const [termYears, setTermYears] = useState("");

  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<Row[]>([]);

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
      setMonthlyPayment(null);
      setTotalInterest(null);
      setSchedule([]);
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
      <p style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
        This farmland loan amortization calculator shows a detailed monthly
        breakdown of payments over time. It helps land buyers understand how
        interest and principal change throughout the life of a farmland loan.
      </p>

      <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
        <label>
          Farmland loan amount
          <div style={{ fontSize: 12, color: "#777" }}>
            Amount financed (principal)
          </div>
          <input
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 400000"
            style={inputStyle}
          />
        </label>

        <label>
          Annual interest rate (APR %)
          <div style={{ fontSize: 12, color: "#777" }}>
            Example: 6 means 6% APR
          </div>
          <input
            type="text"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="e.g. 6"
            style={inputStyle}
          />
        </label>

        <label>
          Loan term (years)
          <div style={{ fontSize: 12, color: "#777" }}>
            Repayment period in years
          </div>
          <input
            type="text"
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            placeholder="e.g. 25"
            style={inputStyle}
          />
        </label>
      </div>

      <button onClick={calculate} style={buttonStyle}>
        Calculate amortization
      </button>

      {monthlyPayment !== null && totalInterest !== null && (
        <div style={summaryBox}>
          <p>
            <strong>Monthly payment:</strong> {format(monthlyPayment)}
          </p>
          <p>
            <strong>Total interest paid:</strong> {format(totalInterest)}
          </p>
          <p style={{ fontSize: 12, color: "#555", marginTop: 8 }}>
            Note: This estimate covers principal + interest only.
          </p>
        </div>
      )}

      {schedule.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Amortization schedule</h3>
          <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Showing the first 24 months. The remaining schedule follows the same
            pattern until payoff.
          </p>

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
        </>
      )}

      <h3 style={{ marginTop: 28 }}>How this calculator works</h3>
      <ul>
        <li>Monthly rate = APR ÷ 12</li>
        <li>Total payments = years × 12</li>
        <li>Each payment is split into interest and principal</li>
        <li>Interest decreases as the remaining balance declines</li>
      </ul>

      <h3>Assumptions & notes</h3>
      <ul>
        <li>Fixed APR assumed</li>
        <li>Principal + interest only</li>
        <li>Land loan fees and taxes are excluded</li>
        <li>Lender rounding may differ slightly</li>
      </ul>

      <h3>Frequently asked questions</h3>
      <p>
        <strong>Is farmland financing different from a home mortgage?</strong>
        <br />
        Yes. Farmland loans often have different terms, rates, and down payment
        requirements.
      </p>

      <p>
        <strong>Why is interest higher early in the loan?</strong>
        <br />
        Interest is calculated on the remaining balance, which is highest at the
        beginning.
      </p>
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
