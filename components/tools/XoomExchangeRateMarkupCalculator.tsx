"use client";

import { useMemo, useState } from "react";

function n(value: number) {
  if (!Number.isFinite(value)) return 0;
  return value;
}

function fmt(value: number, decimals = 2) {
  const v = n(value);
  return v.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function pct(value: number, decimals = 2) {
  const v = n(value);
  return `${fmt(v * 100, decimals)}%`;
}

export default function XoomExchangeRateMarkupCalculator() {
  const [sendAmount, setSendAmount] = useState<number>(1000);
  const [midMarketRate, setMidMarketRate] = useState<number>(0.92);
  const [xoomRate, setXoomRate] = useState<number>(0.9);

  const result = useMemo(() => {
    const amount = Math.max(n(sendAmount), 0);
    const mid = Math.max(n(midMarketRate), 0);
    const rate = Math.max(n(xoomRate), 0);

    if (mid <= 0 || rate <= 0 || amount <= 0) {
      return {
        markup: 0,
        midMarketReceive: 0,
        xoomReceive: 0,
        hiddenCost: 0,
        effectiveLossPct: 0,
      };
    }

    // markup as spread vs mid-market: (mid - xoom) / mid
    const markup = Math.max((mid - rate) / mid, 0);

    const midMarketReceive = amount * mid;
    const xoomReceive = amount * rate;

    const hiddenCost = Math.max(midMarketReceive - xoomReceive, 0); // in recipient currency
    const effectiveLossPct = midMarketReceive > 0 ? hiddenCost / midMarketReceive : 0;

    return { markup, midMarketReceive, xoomReceive, hiddenCost, effectiveLossPct };
  }, [sendAmount, midMarketRate, xoomRate]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Xoom Exchange Rate Markup Calculator</h1>
        <p className="text-muted-foreground">
          Compare the exchange rate shown by Xoom to the mid-market rate to estimate FX markup and hidden cost.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount you send</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={sendAmount}
            onChange={(e) => setSendAmount(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">In your sending currency (e.g., USD).</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mid-market rate</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.0001"
            value={midMarketRate}
            onChange={(e) => setMidMarketRate(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Reference rate from a neutral source.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Xoom exchange rate</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.0001"
            value={xoomRate}
            onChange={(e) => setXoomRate(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Rate shown by Xoom at checkout.</p>
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Estimated markup (spread vs mid-market)</div>
          <div className="text-2xl font-bold">{pct(result.markup)}</div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Receive at mid-market</div>
            <div className="text-lg font-semibold">{fmt(result.midMarketReceive)}</div>
          </div>
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Receive with Xoom</div>
            <div className="text-lg font-semibold">{fmt(result.xoomReceive)}</div>
          </div>
          <div className="rounded-lg border px-4 py-3">
            <div className="text-xs text-muted-foreground">Hidden FX cost</div>
            <div className="text-lg font-semibold">{fmt(result.hiddenCost)}</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This estimates FX markup only. Xoom may also charge explicit transfer fees depending on payment method and destination.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>We compute the spread between the mid-market rate and the Xoom rate.</li>
          <li>We calculate how much the recipient would receive at each rate.</li>
          <li>The difference is the estimated hidden FX cost due to markup.</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium">What is the mid-market rate?</div>
            <div className="text-muted-foreground">
              It&apos;s the reference rate between two currencies, often used as a neutral benchmark before fees/markup.
            </div>
          </div>
          <div>
            <div className="font-medium">Does a lower rate always mean higher cost?</div>
            <div className="text-muted-foreground">
              Usually yes for FX. But overall cost also depends on explicit fees, speed, and transfer method.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
