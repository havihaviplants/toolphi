"use client";

import { useState } from "react";

type DebtInput = {
  id: number;
  name: string;
  balance: string;
  rate: string;
  minPayment: string;
};

type PayoffItem = {
  name: string;
  month: number;
};

interface Result {
  months: number;
  years: number;
  totalInterest: number;
  payoffOrder: PayoffItem[];
}

export default function DebtAvalancheCalculator() {
  const [debts, setDebts] = useState<DebtInput[]>([
    { id: 1, name: "Card 1", balance: "", rate: "", minPayment: "" },
    { id: 2, name: "Card 2", balance: "", rate: "", minPayment: "" },
  ]);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseNumber = (v: string) => {
    const n = parseFloat(v.replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleAddDebt = () => {
    setDebts((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        name: `Card ${prev.length + 1}`,
        balance: "",
        rate: "",
        minPayment: "",
      },
    ]);
  };

  const handleRemoveDebt = (id: number) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleChangeDebt = (
    id: number,
    field: keyof Omit<DebtInput, "id">,
    value: string
  ) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const budget = parseNumber(monthlyBudget);
    if (budget <= 0) {
      setError("Please enter a positive monthly budget.");
      return;
    }

    const parsedDebts = debts
      .map((d) => ({
        name: d.name || "Debt",
        balance: parseNumber(d.balance),
        rate: parseNumber(d.rate),
        minPayment: parseNumber(d.minPayment),
      }))
      .filter((d) => d.balance > 0 && d.minPayment > 0);

    if (!parsedDebts.length) {
      setError(
        "Please enter at least one debt with balance, rate, and minimum payment."
      );
      return;
    }

    const sumMin = parsedDebts.reduce(
      (sum, d) => sum + d.minPayment,
      0
    );
    if (sumMin > budget) {
      setError(
        "Your total minimum payments are greater than your monthly budget. Increase your budget or adjust minimums."
      );
      return;
    }

    // Avalanche: 가장 높은 이자율부터 상환
    const ordered = parsedDebts
      .map((d, idx) => ({ ...d, index: idx }))
      .sort((a, b) => b.rate - a.rate); // rate 내림차순

    let balances = ordered.map((d) => d.balance);
    const rates = ordered.map((d) => d.rate / 100 / 12); // 월 이자율
    const mins = ordered.map((d) => d.minPayment);
    const names = ordered.map((d) => d.name);

    let month = 0;
    let totalInterest = 0;
    const payoffOrder: PayoffItem[] = [];
    const maxMonths = 600; // 50년 제한

    while (balances.some((b) => b > 0) && month < maxMonths) {
      month += 1;

      let activeIndices = balances
        .map((b, idx) => (b > 0 ? idx : -1))
        .filter((idx) => idx >= 0);

      if (!activeIndices.length) break;

      const minSumActive = activeIndices.reduce(
        (sum, idx) => sum + mins[idx],
        0
      );

      const extra = budget - minSumActive;

      // Avalanche: 이자율이 가장 높은 부채를 우선 타겟
      activeIndices.sort((a, b) => rates[b] - rates[a]);
      const targetIndex = activeIndices[0];

      for (let idx of activeIndices) {
        const balanceBefore = balances[idx];
        const r = rates[idx];

        const interest = balanceBefore * r;
        totalInterest += interest;

        let payment = mins[idx];
        if (idx === targetIndex && extra > 0) {
          payment += extra;
        }

        let newBalance = balanceBefore + interest - payment;

        if (newBalance <= 0) {
          if (!payoffOrder.find((p) => p.name === names[idx])) {
            payoffOrder.push({ name: names[idx], month });
          }
          balances[idx] = 0;
        } else {
          balances[idx] = newBalance;
        }
      }
    }

    if (month >= maxMonths) {
      setError(
        "Payoff period is too long to estimate with the current inputs. Try increasing your monthly budget."
      );
      return;
    }

    setResult({
      months: month,
      years: month / 12,
      totalInterest,
      payoffOrder,
    });
  };

  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#555",
          marginBottom: 12,
        }}
      >
        Use the debt avalanche method: pay minimums on all debts and put all
        extra money toward the highest interest rate first. This usually reduces
        total interest paid compared to the snowball method.
      </p>

      <div
        style={{
          display: "grid",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <label style={{ fontSize: 14 }}>
          Monthly budget for debt payments
          <input
            type="number"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
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
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500 }}>Debts</span>
        <button
          type="button"
          onClick={handleAddDebt}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#f9fafb",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          + Add debt
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {debts.map((d) => (
          <div
            key={d.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) repeat(3, minmax(0, 1fr)) auto",
              gap: 6,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={d.name}
              onChange={(e) => handleChangeDebt(d.id, "name", e.target.value)}
              placeholder="Name"
              style={{
                padding: "6px 8px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 13,
              }}
            />
            <input
              type="number"
              value={d.balance}
              onChange={(e) =>
                handleChangeDebt(d.id, "balance", e.target.value)
              }
              placeholder="Balance"
              style={{
                padding: "6px 8px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 13,
              }}
            />
            <input
              type="number"
              value={d.rate}
              onChange={(e) => handleChangeDebt(d.id, "rate", e.target.value)}
              placeholder="APR %"
              style={{
                padding: "6px 8px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 13,
              }}
            />
            <input
              type="number"
              value={d.minPayment}
              onChange={(e) =>
                handleChangeDebt(d.id, "minPayment", e.target.value)
              }
              placeholder="Min payment"
              style={{
                padding: "6px 8px",
                borderRadius: 4,
                border: "1px solid #ddd",
                fontSize: 13,
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveDebt(d.id)}
              style={{
                padding: "4px 6px",
                borderRadius: 4,
                border: "none",
                background: "#fee2e2",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        style={{
          padding: "8px 16px",
          borderRadius: 4,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Calculate avalanche payoff
      </button>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 4,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {result && !error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            border: "1px solid #e5e5e5",
            background: "#fafafa",
            fontSize: 14,
            color: "#333",
          }}
        >
          <p>
            <strong>Total payoff time:</strong> {result.months} months (
            {result.years.toFixed(1)} years)
          </p>
          <p>
            <strong>Total interest paid:</strong> $
            {formatCurrency(result.totalInterest)}
          </p>

          {result.payoffOrder.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>
                Payoff order (avalanche):
              </p>
              <ul style={{ paddingLeft: 18 }}>
                {result.payoffOrder.map((p) => (
                  <li key={p.name}>
                    {p.name}: month {p.month}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
