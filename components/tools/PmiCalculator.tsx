"use client";
import { useState } from "react";

export default function PmiCalculator() {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [pmiRate, setPmiRate] = useState("");
  const [monthlyPmi, setMonthlyPmi] = useState<number | null>(null);

  const calculate = () => {
    const price = parseFloat(homePrice);
    const down = parseFloat(downPayment);
    const rate = parseFloat(pmiRate) / 100;

    if (!price || !rate) {
      setMonthlyPmi(null);
      return;
    }

    const loanAmount = price - (down || 0);
    const annualPmi = loanAmount * rate;
    const monthly = annualPmi / 12;

    setMonthlyPmi(parseFloat(monthly.toFixed(2)));
  };

  return (
    <div>
      <label>Home Price ($)</label>
      <input
        type="number"
        value={homePrice}
        onChange={(e) => setHomePrice(e.target.value)}
        placeholder="400000"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>Down Payment ($)</label>
      <input
        type="number"
        value={downPayment}
        onChange={(e) => setDownPayment(e.target.value)}
        placeholder="40000"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <label>PMI Rate (%)</label>
      <input
        type="number"
        value={pmiRate}
        onChange={(e) => setPmiRate(e.target.value)}
        placeholder="0.8"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button onClick={calculate} style={{ marginTop: 12 }}>
        Calculate PMI
      </button>

      {monthlyPmi !== null && (
        <div style={{ marginTop: 20 }}>
          <h3>Monthly PMI: ${monthlyPmi}</h3>
          <p>
            PMI typically applies until you reach 20% equity. Higher down payments reduce PMI.
          </p>
        </div>
      )}
    </div>
  );
}
