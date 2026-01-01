"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function RiaExchangeRateMarkupCalculator() {
  const [amountUSD, setAmountUSD] = useState<number>(1000);

  // Rates expressed as: 1 USD -> X units of receiving currency
  const [midMarketRate, setMidMarketRate] = useState<number>(1.0);
  const [offeredRate, setOfferedRate] = useState<number>(0.965);

  const r = useMemo(() => {
    const amt = Math.max(0, safeNum(amountUSD));
    const mid = Math.max(0, safeNum(midMarketRate));
    const offered = Math.max(0, safeNum(offeredRate));

    const valid = mid > 0 && offered > 0;

    const markupPercent = valid ? Math.max(0, (mid / offered - 1) * 100) : 0;

    const receiveAtMid = valid ? amt * mid : 0;
    const receiveAtOffered = valid ? amt * offered : 0;

    const hiddenCostUSD = valid ? Math.max(0, amt * (1 - offered / mid)) : 0;
    const effectiveRateLoss = valid ? Math.max(0, (1 - offered / mid) * 100) : 0;

    return {
      amt,
      mid,
      offered,
      valid,
      markupPercent,
      receiveAtMid,
      receiveAtOffered,
      hiddenCostUSD,
      effectiveRateLoss,
    };
  }, [amountUSD, midMarketRate, offeredRate]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Amount to Convert (USD)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={amountUSD}
            onChange={(e) => setAmountUSD(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This estimates <strong>Ria exchange-rate markup</strong> by comparing the offered rate to the mid-market rate.
          FX markup is often the largest hidden cost in international transfers.
        </p>
        <p className="text-sm opacity-80">
          Enter rates as: <strong>1 USD → receiving currency units</strong> (e.g., 1 USD = 0.965 EUR).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Mid-Market Rate (1 USD →)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.000001"
            value={midMarketRate}
            onChange={(e) => setMidMarketRate(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">Reference rate (often shown by Google / FX sites).</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Ria Offered Rate (1 USD →)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.000001"
            value={offeredRate}
            onChange={(e) => setOfferedRate(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">The exchange rate shown by Ria for your transfer.</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-semibold">Exchange Rate Markup: {r.markupPercent.toFixed(2)}%</p>
        <p className="text-sm opacity-80">
          Hidden FX Cost (USD): ${r.hiddenCostUSD.toFixed(2)}{" "}
          <span className="text-sm font-normal opacity-80">
            (Value loss vs mid: {r.effectiveRateLoss.toFixed(2)}%)
          </span>
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-80">
                <th className="py-2 pr-3">Metric</th>
                <th className="py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Receive at mid-market</td>
                <td className="py-2 text-right">{r.receiveAtMid.toFixed(6)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Receive at offered rate</td>
                <td className="py-2 text-right">{r.receiveAtOffered.toFixed(6)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Difference (receiving currency)</td>
                <td className="py-2 text-right">
                  {(r.receiveAtMid - r.receiveAtOffered).toFixed(6)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Hidden cost (USD)</td>
                <td className="py-2 text-right">${r.hiddenCostUSD.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs opacity-70">
          Tip: Total transfer cost = explicit fees + hidden FX cost. Pair this with a “charges” calculator for full all-in cost.
        </p>
      </div>
    </div>
  );
}
