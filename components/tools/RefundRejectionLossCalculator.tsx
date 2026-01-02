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

export default function RefundRejectionLossCalculator() {
  const [expectedRefund, setExpectedRefund] = useState<number>(120);
  const [nonRefundableFees, setNonRefundableFees] = useState<number>(8);
  const [returnShipping, setReturnShipping] = useState<number>(6);
  const [restockingFee, setRestockingFee] = useState<number>(10);
  const [timeHours, setTimeHours] = useState<number>(1.5);
  const [hourlyValue, setHourlyValue] = useState<number>(20);
  const [storeCredit, setStoreCredit] = useState<number>(30);

  const r = useMemo(() => {
    const refund = Math.max(0, n(expectedRefund));
    const fees = Math.max(0, n(nonRefundableFees));
    const shipping = Math.max(0, n(returnShipping));
    const restock = Math.max(0, n(restockingFee));
    const hours = Math.max(0, n(timeHours));
    const hourly = Math.max(0, n(hourlyValue));
    const credit = Math.max(0, n(storeCredit));

    const timeCost = hours * hourly;

    // If rejected, you lose the refund you expected + sunk costs
    const totalLoss = refund + fees + shipping + restock + timeCost;

    // If you received store credit, it offsets loss (partially)
    const lossAfterCredit = Math.max(0, totalLoss - credit);

    return {
      refund,
      fees,
      shipping,
      restock,
      hours,
      hourly,
      credit,
      timeCost,
      totalLoss,
      lossAfterCredit,
    };
  }, [expectedRefund, nonRefundableFees, returnShipping, restockingFee, timeHours, hourlyValue, storeCredit]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Refund Rejection Loss Calculator</h1>
        <p className="text-muted-foreground">
          Estimate your total financial loss when a refund is rejected, including fees, shipping, and time cost. If you
          receive store credit, you can factor it in too.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Expected refund amount</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={expectedRefund}
            onChange={(e) => setExpectedRefund(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">How much money you expected to get back.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Non-refundable fees</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={nonRefundableFees}
            onChange={(e) => setNonRefundableFees(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Processing, filing, restocking policy fees, etc.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Return shipping cost</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={returnShipping}
            onChange={(e) => setReturnShipping(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Shipping you paid to return the item (if any).</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Restocking fee</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={restockingFee}
            onChange={(e) => setRestockingFee(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Some merchants deduct a restocking fee.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Time spent (hours)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.1"
            value={timeHours}
            onChange={(e) => setTimeHours(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Calls, forms, packing, disputes, etc.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hourly value</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            step="0.5"
            value={hourlyValue}
            onChange={(e) => setHourlyValue(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Use your wage, freelance rate, or personal value.</p>
        </div>

        <div className="space-y-2 md:col-span-3">
          <label className="text-sm font-medium">Store credit offered (optional)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={0}
            value={storeCredit}
            onChange={(e) => setStoreCredit(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            If the refund was rejected but you received store credit, enter it here.
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Time cost</span>
          <span className="text-sm font-medium">
            ${fmt(r.timeCost)} ({fmt(r.hours, 1)}h × ${fmt(r.hourly)})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total rejection loss</span>
          <span className="text-sm font-medium">${fmt(r.totalLoss)}</span>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-sm font-semibold">Loss after store credit</span>
          <span className="text-sm font-semibold">${fmt(r.lossAfterCredit)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Total loss includes expected refund + sunk fees + shipping + restocking + time cost. Store credit offsets the loss.
        </p>
      </div>
    </div>
  );
}
