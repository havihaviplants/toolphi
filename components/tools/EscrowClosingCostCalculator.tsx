"use client";

import { useMemo, useState } from "react";

type TransactionType = "purchase" | "refinance";

function n(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function EscrowClosingCostCalculator() {
  const [transactionType, setTransactionType] = useState<TransactionType>("purchase");

  const [homePrice, setHomePrice] = useState<number>(500000);
  const [loanAmount, setLoanAmount] = useState<number>(400000);

  // Common closing costs
  const [escrowSettlementFee, setEscrowSettlementFee] = useState<number>(1200);
  const [titleServicesFee, setTitleServicesFee] = useState<number>(600);
  const [recordingFee, setRecordingFee] = useState<number>(150);
  const [notaryFee, setNotaryFee] = useState<number>(75);
  const [otherClosingCosts, setOtherClosingCosts] = useState<number>(400);

  // Optional lender fee estimate as % of loan amount (simple heuristic)
  const [lenderFeesPercent, setLenderFeesPercent] = useState<number>(0); // e.g., 1.0 = 1%

  const r = useMemo(() => {
    const price = Math.max(0, n(homePrice));
    const loan = Math.max(0, n(loanAmount));

    const escrow = Math.max(0, n(escrowSettlementFee));
    const title = Math.max(0, n(titleServicesFee));
    const recording = Math.max(0, n(recordingFee));
    const notary = Math.max(0, n(notaryFee));
    const other = Math.max(0, n(otherClosingCosts));

    const lender = Math.max(0, n(lenderFeesPercent));
    const lenderFees = loan * (lender / 100);

    const totalClosingCosts = escrow + title + recording + notary + other + lenderFees;

    // Some people want a “typical range”. Keep it simple: +/- 15% estimate band.
    const low = totalClosingCosts * 0.85;
    const high = totalClosingCosts * 1.15;

    return {
      transactionType,
      price,
      loan,
      escrow,
      title,
      recording,
      notary,
      other,
      lenderFeesPercent: lender,
      lenderFees,
      totalClosingCosts,
      low,
      high,
    };
  }, [
    transactionType,
    homePrice,
    loanAmount,
    escrowSettlementFee,
    titleServicesFee,
    recordingFee,
    notaryFee,
    otherClosingCosts,
    lenderFeesPercent,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Transaction Type</label>
          <select className="input" value={transactionType} onChange={(e) => setTransactionType(e.target.value as TransactionType)}>
            <option value="purchase">Home purchase</option>
            <option value="refinance">Refinance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Home Price ($)</label>
          <input className="input" type="number" min={0} step="0.01" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Loan Amount ($) (optional)</label>
          <input className="input" type="number" min={0} step="0.01" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
          <p className="text-xs opacity-70 mt-1">
            For a refinance, loan amount is often the balance being refinanced.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Escrow / Settlement Fee ($)</label>
          <input className="input" type="number" min={0} step="0.01" value={escrowSettlementFee} onChange={(e) => setEscrowSettlementFee(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Title Services Fee ($)</label>
          <input className="input" type="number" min={0} step="0.01" value={titleServicesFee} onChange={(e) => setTitleServicesFee(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Recording Fee ($)</label>
          <input className="input" type="number" min={0} step="0.01" value={recordingFee} onChange={(e) => setRecordingFee(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Notary Fee ($)</label>
          <input className="input" type="number" min={0} step="0.01" value={notaryFee} onChange={(e) => setNotaryFee(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Other Closing Costs ($)</label>
          <input className="input" type="number" min={0} step="0.01" value={otherClosingCosts} onChange={(e) => setOtherClosingCosts(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Lender Fees (% of loan) (optional)</label>
          <input className="input" type="number" min={0} step="0.01" value={lenderFeesPercent} onChange={(e) => setLenderFeesPercent(Number(e.target.value))} />
          <p className="text-xs opacity-70 mt-1">If unknown, keep 0% and enter fees explicitly in “Other.”</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This tool estimates common escrow/closing costs for a {r.transactionType === "purchase" ? "purchase" : "refinance"}. Actual costs vary by state, lender, and title company.
        </p>

        <p className="font-semibold">Estimated Total Closing Costs: ${r.totalClosingCosts.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Escrow/Settlement ${r.escrow.toFixed(2)} + Title ${r.title.toFixed(2)} + Recording ${r.recording.toFixed(2)} + Notary ${r.notary.toFixed(2)} + Other ${r.other.toFixed(2)} + Lender fees ${r.lenderFees.toFixed(2)}
        </p>

        <div className="pt-2">
          <p className="font-semibold">Simple Estimate Range: ${r.low.toFixed(2)} – ${r.high.toFixed(2)}</p>
          <p className="text-xs opacity-70">
            Range is a rough +/- 15% band for planning, not a quote.
          </p>
        </div>
      </div>
    </div>
  );
}
