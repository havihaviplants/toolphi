"use client";

import { useState } from "react";

export default function ExchangeRateFeeImpactCalculator() {
  const [marketRate, setMarketRate] = useState("");
  const [offeredRate, setOfferedRate] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<null | {
    realValue: number;
    receivedValue: number;
    loss: number;
    lossPercent: number;
  }>(null);

  const calculate = () => {
    const mRate = parseFloat(marketRate);
    const oRate = parseFloat(offeredRate);
    const amt = parseFloat(amount);

    if (!mRate || !oRate || !amt) return;

    const realValue = amt * mRate;
    const receivedValue = amt * oRate;
    const loss = realValue - receivedValue;
    const lossPercent = (loss / realValue) * 100;

    setResult({
      realValue,
      receivedValue,
      loss,
      lossPercent,
    });
  };

  return (
    <div className="tool-container">
      <h1>Exchange Rate Fee Impact Calculator</h1>
      <p>
        Banks and payment services often hide fees inside exchange rates.
        This calculator shows how much you actually lose due to exchange
        rate markups compared to the mid-market rate.
      </p>

      <div className="input-group">
        <label>Mid-Market Exchange Rate</label>
        <input
          type="number"
          step="any"
          value={marketRate}
          onChange={(e) => setMarketRate(e.target.value)}
          placeholder="e.g. 1.10"
        />
      </div>

      <div className="input-group">
        <label>Offered Exchange Rate</label>
        <input
          type="number"
          step="any"
          value={offeredRate}
          onChange={(e) => setOfferedRate(e.target.value)}
          placeholder="e.g. 1.05"
        />
      </div>

      <div className="input-group">
        <label>Amount to Exchange</label>
        <input
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1000"
        />
      </div>

      <button onClick={calculate}>Calculate</button>

      {result && (
        <div className="result-box">
          <p>
            <strong>Value at Mid-Market Rate:</strong>{" "}
            {result.realValue.toFixed(2)}
          </p>
          <p>
            <strong>Value at Offered Rate:</strong>{" "}
            {result.receivedValue.toFixed(2)}
          </p>
          <p>
            <strong>Hidden Exchange Rate Loss:</strong>{" "}
            {result.loss.toFixed(2)}
          </p>
          <p>
            <strong>Loss Percentage:</strong>{" "}
            {result.lossPercent.toFixed(2)}%
          </p>
        </div>
      )}

      <section className="tool-footer">
        <h2>How it works</h2>
        <p>
          Even if a bank does not charge an explicit fee, it may offer
          a worse exchange rate than the true market rate. The difference
          between the mid-market rate and the offered rate represents
          a hidden cost.
        </p>

        <h2>FAQ</h2>
        <p>
          <strong>Is an exchange rate markup the same as a fee?</strong><br />
          Not exactly. A markup is hidden inside the exchange rate, while
          a fee is charged separately. Both increase your total cost.
        </p>
        <p>
          <strong>How can I reduce exchange rate losses?</strong><br />
          Compare rates across providers and look for services that use
          mid-market rates with transparent fees.
        </p>
      </section>
    </div>
  );
}
