"use client";
import { useState } from "react";

export default function DtiCalculator() {
  const [income, setIncome] = useState("");
  const [debt, setDebt] = useState("");
  const [dti, setDti] = useState<number | null>(null);

  const calculate = () => {
    const inc = parseFloat(income);
    const deb = parseFloat(debt);

    if (!inc || !deb || inc <= 0) {
      setDti(null);
      return;
    }

    const ratio = (deb / inc) * 100;
    setDti(parseFloat(ratio.toFixed(2)));
  };

  return (
    <div>
      <label>Monthly Gross Income ($)</label>
      <input
        type="number"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
        placeholder="5000"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Total Monthly Debt Payments ($)</label>
      <input
        type="number"
        value={debt}
        onChange={(e) => setDebt(e.target.value)}
        placeholder="1500"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button onClick={calculate} style={{ marginTop: 12 }}>
        Calculate DTI
      </button>

      {dti !== null && (
        <div style={{ marginTop: 20 }}>
          <h3>Your DTI Ratio: {dti}%</h3>
          <p>
            {dti < 36
              ? "✔ Excellent — qualifies for most mortgages."
              : dti < 43
              ? "✔ Acceptable — meets many loan requirements."
              : "✘ High — may not qualify; consider lowering debt."}
          </p>
        </div>
      )}
    </div>
  );
}
