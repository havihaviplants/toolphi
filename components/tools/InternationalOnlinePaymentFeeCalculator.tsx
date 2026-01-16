"use client";

import { useMemo, useState } from "react";

export default function InternationalOnlinePaymentFeeCalculator() {
  const [amount, setAmount] = useState("1000");
  const [processingRate, setProcessingRate] = useState("2.9");
  const [processingFixed, setProcessingFixed] = useState("0.30");
  const [crossBorderRate, setCrossBorderRate] = useState("1.0");
  const [fxRate, setFxRate] = useState("2.0");

  const result = useMemo(() => {
    const amt = Number(amount);
    const procPct = Number(processingRate);
    const procFixed = Number(processingFixed);
    const crossPct = Number(crossBorderRate);
    const fxPct = Number(fxRate);

    const valid =
      amt > 0 &&
      procPct >= 0 &&
      procFixed >= 0 &&
      crossPct >= 0 &&
      fxPct >= 0 &&
      isFinite(amt) &&
      isFinite(procPct) &&
      isFinite(procFixed) &&
      isFinite(crossPct) &&
      isFinite(fxPct);

    if (!valid) return null;

    const processingFee = (amt * procPct) / 100 + procFixed;
    const crossBorderFee = (amt * crossPct) / 100;
    const fxFee = (amt * fxPct) / 100;

    const totalFees = processingFee + crossBorderFee + fxFee;
    const effectiveRate = (totalFees / amt) * 100;
    const netReceived = amt - totalFees;

    return {
      processingFee,
      crossBorderFee,
      fxFee,
      totalFees,
      effectiveRate,
      netReceived,
    };
  }, [amount, processingRate, processingFixed, crossBorderRate, fxRate]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          International Online Payment Fee Calculator
        </h1>
        <p className="mt-2 text-gray-600">
          Estimate international payment fees including processing, cross-border,
          and currency conversion (FX) fees.
        </p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <div>
          <label className="block font-medium">Transaction Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Amount in the original transaction currency.
          </p>
        </div>

        <div>
          <label className="block font-medium">Processing Fee Rate (%)</label>
          <input
            type="number"
            value={processingRate}
            onChange={(e) => setProcessingRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Processing Fixed Fee</label>
          <input
            type="number"
            value={processingFixed}
            onChange={(e) => setProcessingFixed(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Cross-Border Fee Rate (%)</label>
          <input
            type="number"
            value={crossBorderRate}
            onChange={(e) => setCrossBorderRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Extra fee charged for international / cross-border payments.
          </p>
        </div>

        <div>
          <label className="block font-medium">FX Conversion Fee Rate (%)</label>
          <input
            type="number"
            value={fxRate}
            onChange={(e) => setFxRate(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Currency conversion markup or FX fee, if applicable.
          </p>
        </div>
      </div>

      {result && (
        <div className="max-w-2xl rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <span>Processing Fee</span>
            <span className="font-semibold">${result.processingFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Cross-Border Fee</span>
            <span className="font-semibold">${result.crossBorderFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>FX Conversion Fee</span>
            <span className="font-semibold">${result.fxFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-3">
            <span>Total Fees</span>
            <span className="font-semibold">${result.totalFees.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Net Received (after fees)</span>
            <span className="font-semibold">${result.netReceived.toFixed(2)}</span>
          </div>

          <p className="text-sm text-gray-600">
            Effective fee rate: <strong>{result.effectiveRate.toFixed(2)}%</strong>
          </p>
        </div>
      )}

      <div className="max-w-2xl space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="text-gray-600">
          Total fees are calculated by combining processing fees, cross-border
          fees, and FX conversion fees (when currency conversion is involved).
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div>
          <h3 className="font-medium">Do all international payments include FX fees?</h3>
          <p className="text-gray-600">
            Not always. FX fees apply when the provider converts currencies or
            adds a conversion markup.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Are cross-border fees always separate?</h3>
          <p className="text-gray-600">
            Some providers bundle them into a single rate. Use the terms that
            match your fee schedule.
          </p>
        </div>
      </div>
    </div>
  );
}
