"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

type Provider = {
  name: string;
  fixedFee: number;   // $
  percentFee: number; // %
  fxMarkup: number;   // %
};

export default function MoneyTransferServiceComparisonCalculator() {
  const [amount, setAmount] = useState<number>(1000);

  // 기본 provider 5종 (필요하면 이름/값 수정 가능)
  const [providers, setProviders] = useState<Provider[]>([
    { name: "Wise", fixedFee: 2, percentFee: 0.4, fxMarkup: 0.2 },
    { name: "Western Union", fixedFee: 5, percentFee: 0.8, fxMarkup: 1.0 },
    { name: "MoneyGram", fixedFee: 4, percentFee: 0.6, fxMarkup: 0.8 },
    { name: "Xoom", fixedFee: 3, percentFee: 0.7, fxMarkup: 0.9 },
    { name: "Ria", fixedFee: 3, percentFee: 0.5, fxMarkup: 0.7 },
  ]);

  const r = useMemo(() => {
    const a = Math.max(0, safeNum(amount));

    const rows = providers.map((p) => {
      const fixed = Math.max(0, safeNum(p.fixedFee));
      const pct = Math.max(0, safeNum(p.percentFee));
      const fx = Math.max(0, safeNum(p.fxMarkup));

      const percentCost = a * (pct / 100);
      const fxCost = a * (fx / 100);
      const totalCost = fixed + percentCost + fxCost;
      const effectiveRate = a > 0 ? (totalCost / a) * 100 : 0;

      return {
        name: (p.name || "").trim() || "Provider",
        fixed,
        percentCost,
        fxCost,
        totalCost,
        effectiveRate,
      };
    });

    const sorted = [...rows].sort((x, y) => x.totalCost - y.totalCost);
    const cheapest = sorted[0];

    return { a, rows, sorted, cheapest };
  }, [amount, providers]);

  const update = (idx: number, patch: Partial<Provider>) => {
    setProviders((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Amount to Send ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Compare providers using explicit fees and hidden exchange-rate costs (FX markup).
          The cheapest provider is the one with the lowest total cost for your amount.
        </p>
        <p className="text-sm opacity-80">
          Total Cost = Fixed Fee + (Amount × % Fee) + (Amount × FX Markup)
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((p, idx) => (
          <div key={idx} className="rounded-lg border p-4 space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Provider</label>
                <input
                  className="input"
                  value={p.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="e.g. Wise"
                />
              </div>
              <div />
              <div>
                <label className="block text-sm font-medium">Fixed Fee ($)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={p.fixedFee}
                  onChange={(e) => update(idx, { fixedFee: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Percentage Fee (%)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={p.percentFee}
                  onChange={(e) => update(idx, { percentFee: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">FX Markup (%)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={p.fxMarkup}
                  onChange={(e) => update(idx, { fxMarkup: Number(e.target.value) })}
                />
              </div>
            </div>

            <p className="text-xs opacity-70">
              Tip: Many “low-fee” transfers are expensive due to FX markup. Always compare total cost.
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-semibold">
          Cheapest Provider: {r.cheapest?.name ?? "—"}{" "}
          {r.cheapest ? `(Total Cost: $${r.cheapest.totalCost.toFixed(2)})` : ""}
        </p>
        <p className="text-sm opacity-80">Effective fee rate = Total Cost ÷ Amount</p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-80">
                <th className="py-2 pr-3">Provider</th>
                <th className="py-2 pr-3 text-right">Fixed</th>
                <th className="py-2 pr-3 text-right">% Fee</th>
                <th className="py-2 pr-3 text-right">FX</th>
                <th className="py-2 pr-3 text-right">Total</th>
                <th className="py-2 text-right">Eff. Rate</th>
              </tr>
            </thead>
            <tbody>
              {r.sorted.map((x) => (
                <tr key={x.name} className="border-t">
                  <td className="py-2 pr-3 font-medium">
                    {x.name}
                    {r.cheapest && x.name === r.cheapest.name ? (
                      <span className="ml-2 text-xs font-semibold opacity-80">(cheapest)</span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-3 text-right">${x.fixed.toFixed(2)}</td>
                  <td className="py-2 pr-3 text-right">${x.percentCost.toFixed(2)}</td>
                  <td className="py-2 pr-3 text-right">${x.fxCost.toFixed(2)}</td>
                  <td className="py-2 pr-3 text-right font-semibold">${x.totalCost.toFixed(2)}</td>
                  <td className="py-2 text-right">{x.effectiveRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
