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

export default function DebtSnowballCalculator() {
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

    // 숫자로 변환 + 유효한 부채만 남기기
    const parsedDebts = debts
      .map((d) => ({
        name: d.name || "Debt",
        balance: parseNumber(d.balance),
        rate: parseNumber(d.rate),
        minPayment: parseNumber(d.minPayment),
      }))
      .filter((d) => d.balance > 0 && d.minPayment > 0);

    if (!parsedDebts.length) {
      setError("Please enter at least one debt with balance and minimum payment.");
      return;
    }

    // 최소 상환금 합이 예산보다 크면 에러
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

    // 잔액 오름차순 정렬 (스노우볼: 가장 작은 잔액부터 상환)
    const ordered = parsedDebts
      .map((d, idx) => ({ ...d, index: idx }))
      .sort((a, b) => a.balance - b.balance);

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

      // 현재 살아있는 부채 기준으로 최소 상환 합 계산
      let activeIndices = balances
        .map((b, idx) => (b > 0 ? idx : -1))
        .filter((idx) => idx >= 0);

      if (!activeIndices.length) break;

      const minSumActive = activeIndices.reduce(
        (sum, idx) => sum + mins[idx],
        0
      );

      // 이론상 여기서 budget < minSumActive면, 위에서 이미 필터링됨.
      const extra = budget - minSumActive;

      // 가장 작은 잔액을 가진 부채(스노우볼 타겟)
      activeIndices.sort((a, b) => balances[a] - balances[b]);
      const targetIndex = activeIndices[0];

      // 한 달 이자 계산 + 상환
      for (let idx of activeIndices) {
        const balanceBefore = balances[idx];
        const r = rates[idx];

        const interest = balanceBefore * r;
        totalInterest += interest;

        let payment = mins[idx];
        if (idx === targetIndex && extra > 0) {
          payment += extra;
        }

        // 과지불 방지
        const newBalance = balanceBefore + interest - payment;

        if (newBalance <= 0) {
          // 부채 다 갚음
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
        Use the debt snowball method: pay minimums on all debts and put all
        extra money toward the smallest balance first. As each debt is paid
        off, its payment rolls into the next one.
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
        Calculate snowball payoff
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
                Payoff order (snowball):
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
