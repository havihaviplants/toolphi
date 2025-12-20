"use client";

import { useMemo, useState } from "react";

function clampNumber(v: number) {
  return Number.isFinite(v) ? v : 0;
}

type Payer = "buyer" | "seller" | "split";

export default function EscrowFeeCalculator() {
  const [homePrice, setHomePrice] = useState<number>(500000);
  const [loanAmount, setLoanAmount] = useState<number>(400000);

  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(6000);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1200);

  const [escrowFeeFixed, setEscrowFeeFixed] = useState<number>(1200);
  const [escrowFeePercent, setEscrowFeePercent] = useState<number>(0); // % of home price (optional)

  const [payer, setPayer] = useState<Payer>("buyer");

  const result = useMemo(() => {
    const price = Math.max(0, clampNumber(homePrice));
    const loan = Math.max(0, clampNumber(loanAmount));

    const tax = Math.max(0, clampNumber(annualPropertyTax));
    const ins = Math.max(0, clampNumber(annualHomeInsurance));

    const fixed = Math.max(0, clampNumber(escrowFeeFixed));
    const pct = Math.max(0, clampNumber(escrowFeePercent));

    const feePercentCost = price * (pct / 100);
    const closingEscrowFee = fixed + feePercentCost;

    const monthlyEscrowPayment = (tax + ins) / 12;

    let buyerFee = 0;
    let sellerFee = 0;

    if (payer === "buyer") {
      buyerFee = closingEscrowFee;
    } else if (payer === "seller") {
      sellerFee = closingEscrowFee;
    } else {
      buyerFee = closingEscrowFee / 2;
      sellerFee = closingEscrowFee / 2;
    }

    return {
      price,
      loan,
      tax,
      ins,
      fixed,
      feePercentCost,
      closingEscrowFee,
      monthlyEscrowPayment,
      buyerFee,
      sellerFee,
    };
  }, [homePrice, loanAmount, annualPropertyTax, annualHomeInsurance, escrowFeeFixed, escrowFeePercent, payer]);

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
          <label className="block text-sm font-medium">Loan Amount ($) (optional)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
          />
          <p className="text-xs opacity-70 mt-1">
            Escrow fees are often based on the transaction and local practice (not strictly loan size).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Annual Property Tax ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={annualPropertyTax}
            onChange={(e) => setAnnualPropertyTax(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Annual Home Insurance ($/year)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={annualHomeInsurance}
            onChange={(e) => setAnnualHomeInsurance(Number(e.target.value))}
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

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Who pays the escrow fee?</label>
          <select className="input" value={payer} onChange={(e) => setPayer(e.target.value as Payer)}>
            <option value="buyer">Buyer pays</option>
            <option value="seller">Seller pays</option>
            <option value="split">Split 50/50</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This tool estimates (1) a one-time closing escrow fee and (2) your monthly escrow payment for property tax
          and insurance. Local escrow/title practices vary, so treat this as an estimate.
        </p>

        <p className="font-semibold">Estimated Closing Escrow Fee: ${result.closingEscrowFee.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Breakdown — Fixed: ${result.fixed.toFixed(2)}, Percent of price: ${result.feePercentCost.toFixed(2)}
        </p>

        <div className="pt-2">
          <p className="font-semibold">Estimated Monthly Escrow Payment (Tax + Insurance): ${result.monthlyEscrowPayment.toFixed(2)}</p>
          <p className="text-sm opacity-80">
            Monthly escrow = (Annual tax + Annual insurance) / 12 = (${result.tax.toFixed(2)} + ${result.ins.toFixed(2)}) / 12
          </p>
        </div>

        <div className="pt-2">
          <p>Buyer escrow fee: ${result.buyerFee.toFixed(2)}</p>
          <p>Seller escrow fee: ${result.sellerFee.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
