"use client";

import { useMemo, useState } from "react";

type PayerMode = "buyer" | "seller" | "split" | "custom";

function num(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function EscrowFeesBuyerSellerCalculator() {
  const [homePrice, setHomePrice] = useState<number>(500000);

  const [escrowFeeFixed, setEscrowFeeFixed] = useState<number>(1200);
  const [escrowFeePercent, setEscrowFeePercent] = useState<number>(0); // % of home price

  const [payerMode, setPayerMode] = useState<PayerMode>("buyer");
  const [buyerSharePercent, setBuyerSharePercent] = useState<number>(50); // only for custom

  const r = useMemo(() => {
    const price = Math.max(0, num(homePrice));
    const fixed = Math.max(0, num(escrowFeeFixed));
    const pct = Math.max(0, num(escrowFeePercent));

    const pctCost = price * (pct / 100);
    const totalFee = fixed + pctCost;

    let buyerPct = 0;
    if (payerMode === "buyer") buyerPct = 100;
    else if (payerMode === "seller") buyerPct = 0;
    else if (payerMode === "split") buyerPct = 50;
    else buyerPct = Math.min(100, Math.max(0, num(buyerSharePercent)));

    const buyerFee = totalFee * (buyerPct / 100);
    const sellerFee = totalFee - buyerFee;

    return {
      price,
      fixed,
      pct,
      pctCost,
      totalFee,
      buyerPct,
      buyerFee,
      sellerFee,
      payerMode,
    };
  }, [homePrice, escrowFeeFixed, escrowFeePercent, payerMode, buyerSharePercent]);

  const showCustom = payerMode === "custom";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Home Price ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={homePrice}
            onChange={(e) => setHomePrice(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Escrow Fee (Fixed, $)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={escrowFeeFixed}
            onChange={(e) => setEscrowFeeFixed(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Escrow Fee (% of Home Price) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={escrowFeePercent}
            onChange={(e) => setEscrowFeePercent(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Who pays?</label>
          <select className="input" value={payerMode} onChange={(e) => setPayerMode(e.target.value as PayerMode)}>
            <option value="buyer">Buyer pays 100%</option>
            <option value="seller">Seller pays 100%</option>
            <option value="split">Split 50/50</option>
            <option value="custom">Custom split</option>
          </select>
        </div>

        {showCustom && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Buyer share (%)</label>
            <input
              className="input"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={buyerSharePercent}
              onChange={(e) => setBuyerSharePercent(Number(e.target.value))}
            />
            <p className="text-xs opacity-70 mt-1">Seller share is the remainder to 100%.</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This estimates a one-time escrow fee at closing and splits it between buyer and seller based on your selection.
          Local practice varies by state and by title/escrow company.
        </p>

        <p className="font-semibold">Total Escrow Fee: ${r.totalFee.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Breakdown — Fixed: ${r.fixed.toFixed(2)}, Percent of price: ${r.pctCost.toFixed(2)}
        </p>

        <div className="pt-2">
          <p className="font-semibold">Buyer pays ({r.buyerPct.toFixed(2)}%): ${r.buyerFee.toFixed(2)}</p>
          <p className="font-semibold">Seller pays ({(100 - r.buyerPct).toFixed(2)}%): ${r.sellerFee.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
