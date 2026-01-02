"use client";

import { useMemo, useState } from "react";

export default function RefundCancellationCostCalculator() {
  const [expectedRefund, setExpectedRefund] = useState<number>(200);
  const [cancellationFee, setCancellationFee] = useState<number>(10);
  const [cancellationRate, setCancellationRate] = useState<number>(3);
  const [nonRefundableFees, setNonRefundableFees] = useState<number>(4);
  const [returnShipping, setReturnShipping] = useState<number>(6);
  const [timeHours, setTimeHours] = useState<number>(0.8);
  const [hourlyValue, setHourlyValue] = useState<number>(25);

  const { totalCost, effectiveRate, percentFee, timeCost } = useMemo(() => {
    const refund = Math.max(0, Number.isFinite(expectedRefund) ? expectedRefund : 0);
    const flatFee = Math.max(0, Number.isFinite(cancellationFee) ? cancellationFee : 0);
    const rate = Math.max(0, Number.isFinite(cancellationRate) ? cancellationRate : 0);
    const fees = Math.max(0, Number.isFinite(nonRefundableFees) ? nonRefundableFees : 0);
    const ship = Math.max(0, Number.isFinite(returnShipping) ? returnShipping : 0);
    const hours = Math.max(0, Number.isFinite(timeHours) ? timeHours : 0);
    const hourly = Math.max(0, Number.isFinite(hourlyValue) ? hourlyValue : 0);

    const pctFee = refund * (rate / 100);
    const tCost = hours * hourly;

    const total = flatFee + pctFee + fees + ship + tCost;
    const eff = refund > 0 ? (total / refund) * 100 : 0;

    return {
      percentFee: pctFee,
      timeCost: tCost,
      totalCost: total,
      effectiveRate: eff,
    };
  }, [
    expectedRefund,
    cancellationFee,
    cancellationRate,
    nonRefundableFees,
    returnShipping,
    timeHours,
    hourlyValue,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Expected Refund Amount ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={expectedRefund}
            onChange={(e) => setExpectedRefund(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Cancellation Fee (flat) ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={cancellationFee}
            onChange={(e) => setCancellationFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Cancellation Rate (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.1"
            value={cancellationRate}
            onChange={(e) => setCancellationRate(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Non-Refundable Fees ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={nonRefundableFees}
            onChange={(e) => setNonRefundableFees(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Return Shipping Already Paid ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={returnShipping}
            onChange={(e) => setReturnShipping(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Time Spent (hours)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.1"
            value={timeHours}
            onChange={(e) => setTimeHours(Number(e.target.value))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Hourly Value ($/hour)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.5"
            value={hourlyValue}
            onChange={(e) => setHourlyValue(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          Total cancellation cost includes flat fee, percent fee, sunk fees, shipping, and time cost.
        </p>
        <p className="text-sm opacity-80">Percent-based fee: ${percentFee.toFixed(2)}</p>
        <p className="text-sm opacity-80">Time cost: ${timeCost.toFixed(2)}</p>
        <p className="font-semibold">Total Cancellation Cost: ${totalCost.toFixed(2)}</p>
        <p>Effective Cost Rate: {effectiveRate.toFixed(2)}%</p>
      </div>
    </div>
  );
}
