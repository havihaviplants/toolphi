"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function WireTransferTotalCostCalculator() {
  const [amount, setAmount] = useState<number>(2000);

  const [outgoingFee, setOutgoingFee] = useState<number>(25);
  const [intermediaryFees, setIntermediaryFees] = useState<number>(15);
  const [recipientBankCharges, setRecipientBankCharges] = useState<number>(10);

  // FX markup models hidden cost when currency conversion is applied
  const [fxMarkup, setFxMarkup] = useState<number>(1.2);

  const r = useMemo(() => {
    const a = Math.max(0, safeNum(amount));

    const out = Math.max(0, safeNum(outgoingFee));
    const mid = Math.max(0, safeNum(intermediaryFees));
    const rec = Math.max(0, safeNum(recipientBankCharges));
    const fx = Math.max(0, safeNum(fxMarkup));

    const fxCost = a * (fx / 100);
    const totalCost = out + mid + rec + fxCost;

    const effectiveRate = a > 0 ? (totalCost / a) * 100 : 0;
    const remainingAfterCost = Math.max(0, a - totalCost);

    return {
      a,
      out,
      mid,
      rec,
      fx,
      fxCost,
      totalCost,
      effectiveRate,
      remainingAfterCost,
    };
  }, [amount, outgoingFee, intermediaryFees, recipientBankCharges, fxMarkup]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Wire Transfer Amount ($)</label>
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
          This calculator estimates <strong>all-in wire transfer cost</strong>—not just the outgoing fee.
          International wires can include intermediary bank fees, recipient bank charges, and hidden FX costs.
        </p>
        <p className="text-sm opacity-80">
          Total Cost = Outgoing Fee + Intermediary Fees + Recipient Charges + (Amount × FX Markup)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Outgoing Bank Wire Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={outgoingFee}
            onChange={(e) => setOutgoingFee(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            The fee your bank charges to send the wire (outgoing wire fee).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Intermediary Bank Fees ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={intermediaryFees}
            onChange={(e) => setIntermediaryFees(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Some international wires pass through intermediary banks that deduct fees.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Recipient Bank Charges ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={recipientBankCharges}
            onChange={(e) => setRecipientBankCharges(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            The recipient’s bank may charge an incoming wire fee or handling fee.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">FX Markup (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={fxMarkup}
            onChange={(e) => setFxMarkup(Number(e.target.value))}
          />
          <p className="mt-1 text-xs opacity-70">
            Hidden exchange-rate cost if the wire involves currency conversion.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="font-semibold">
          Total Cost: ${r.totalCost.toFixed(2)}{" "}
          <span className="text-sm font-normal opacity-80">
            (Effective Rate: {r.effectiveRate.toFixed(2)}%)
          </span>
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-80">
                <th className="py-2 pr-3">Cost Component</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Outgoing bank fee</td>
                <td className="py-2 text-right">${r.out.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Intermediary bank fees</td>
                <td className="py-2 text-right">${r.mid.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">Recipient bank charges</td>
                <td className="py-2 text-right">${r.rec.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-medium">FX markup cost</td>
                <td className="py-2 text-right">${r.fxCost.toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td className="py-2 pr-3 font-semibold">Total</td>
                <td className="py-2 text-right font-semibold">${r.totalCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs opacity-70">
          Note: Some banks send wires as “SHA/OUR/BEN” fee types. Intermediary/recipient deductions can vary.
        </p>
      </div>
    </div>
  );
}
