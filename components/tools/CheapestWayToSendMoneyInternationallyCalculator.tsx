"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

type Option = {
  name: string;
  fixedFee: number;   // $
  percentFee: number; // %
  fxMarkup: number;   // %
};

export default function CheapestWayToSendMoneyInternationallyCalculator() {
  const [amount, setAmount] = useState<number>(1000);

  const [options, setOptions] = useState<Option[]>([
    { name: "Bank Wire", fixedFee: 25, percentFee: 0, fxMarkup: 1.5 },
    { name: "Online Transfer", fixedFee: 4, percentFee: 0.5, fxMarkup: 0.6 },
    { name: "Cash Pickup", fixedFee: 8, percentFee: 1, fxMarkup: 1 },
  ]);

  const r = useMemo(() => {
    const a = Math.max(0, safeNum(amount));

    const rows = options.map((o) => {
      const fixed = Math.max(0, safeNum(o.fixedFee));
      const pct = Math.max(0, safeNum(o.percentFee));
      const fx = Math.max(0, safeNum(o.fxMarkup));

      const percentCost = a * (pct / 100);
      const fxCost = a * (fx / 100);
      const totalCost = fixed + percentCost + fxCost;
      const effectiveRate = a > 0 ? (totalCost / a) * 100 : 0;

      return {
        name: (o.name || "").trim() || "Option",
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
  }, [amount, options]);

  const update = (idx: number, patch: Partial<Option>) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
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
          Compare explicit fees and hidden exchange-rate costs (FX markup). Lowest total cost is usually the cheapest option.
        </p>
        <p className="text-sm opacity-80">
          Total Cost = Fixed Fee + (Amount × % Fee) + (Amount × FX Markup)
        </p>
      </div>

      <div className="space-y-4">
        {options.map((o, idx) => (
          <div key={idx} className="rounded-lg border p-4 space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">Option Name</label>
                <input
                  className="input"
                  value={o.name}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="e.g. Bank Wire"
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
                  value={o.fixedFee}
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
                  value={o.percentFee}
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
                  value={o.fxMarkup}
                  onChange={(e) => update(idx, { fxMarkup: Number(e.target.value) })}
                />
              </div>
            </div>

            <p className="text-xs opacity-70">
              Tip: If a provider shows “$0 fee”, FX markup is often the real cost.
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-semibold">
          Cheapest Option: {r.cheapest?.name ?? "—"}{" "}
          {r.cheapest ? `(Total Cost: $${r.cheapest.totalCost.toFixed(2)})` : ""}
        </p>
        <p className="text-sm opacity-80">
          Effective fee rate = Total Cost ÷ Amount
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-80">
                <th className="py-2 pr-3">Option</th>
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
