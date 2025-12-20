"use client";

import { useMemo, useState } from "react";

function safeNum(v: number) {
  return Number.isFinite(v) ? v : 0;
}

export default function EscrowCostCalculator() {
  const [homePrice, setHomePrice] = useState<number>(500000);
  const [loanAmount, setLoanAmount] = useState<number>(400000);

  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(6000);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1200);

  // One-time closing costs that people often lump into "escrow costs"
  const [escrowFee, setEscrowFee] = useState<number>(1200);
  const [titleServiceFee, setTitleServiceFee] = useState<number>(300);
  const [recordingFee, setRecordingFee] = useState<number>(150);
  const [otherClosingCosts, setOtherClosingCosts] = useState<number>(0);

  const includeFirstMonthsEscrow = true; // keep simple & stable

  const r = useMemo(() => {
    const price = Math.max(0, safeNum(homePrice));
    const loan = Math.max(0, safeNum(loanAmount));

    const tax = Math.max(0, safeNum(annualPropertyTax));
    const ins = Math.max(0, safeNum(annualHomeInsurance));

    const escrow = Math.max(0, safeNum(escrowFee));
    const title = Math.max(0, safeNum(titleServiceFee));
    const recording = Math.max(0, safeNum(recordingFee));
    const other = Math.max(0, safeNum(otherClosingCosts));

    const monthlyEscrow = (tax + ins) / 12;

    const oneTimeEscrowRelatedCosts = escrow + title + recording + other;

    const totalEstimatedAtClosing = includeFirstMonthsEscrow
      ? oneTimeEscrowRelatedCosts + monthlyEscrow
      : oneTimeEscrowRelatedCosts;

    return {
      price,
      loan,
      tax,
      ins,
      monthlyEscrow,
      escrow,
      title,
      recording,
      other,
      oneTimeEscrowRelatedCosts,
      totalEstimatedAtClosing,
    };
  }, [homePrice, loanAmount, annualPropertyTax, annualHomeInsurance, escrowFee, titleServiceFee, recordingFee, otherClosingCosts]);

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
          <p className="text-xs opacity-70 mt-1">Kept for context; this estimate focuses on escrow-related costs.</p>
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
          <label className="block text-sm font-medium">Escrow / Settlement Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={escrowFee}
            onChange={(e) => setEscrowFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Title Service Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={titleServiceFee}
            onChange={(e) => setTitleServiceFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Recording Fee ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={recordingFee}
            onChange={(e) => setRecordingFee(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Other Closing Costs ($)</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={otherClosingCosts}
            onChange={(e) => setOtherClosingCosts(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm opacity-80">
          This estimates typical escrow-related costs people include at closing (escrow/settlement, title service,
          recording, etc.) plus your monthly escrow for tax and insurance.
        </p>

        <p className="font-semibold">Estimated Monthly Escrow (Tax + Insurance): ${r.monthlyEscrow.toFixed(2)}</p>
        <p className="text-sm opacity-80">
          Monthly escrow = (Annual tax + Annual insurance) / 12
        </p>

        <div className="pt-2">
          <p className="font-semibold">One-time Escrow-Related Closing Costs: ${r.oneTimeEscrowRelatedCosts.toFixed(2)}</p>
          <p className="text-sm opacity-80">
            Escrow/Settlement + Title + Recording + Other = ${r.escrow.toFixed(2)} + ${r.title.toFixed(2)} + ${r.recording.toFixed(2)} + ${r.other.toFixed(2)}
          </p>
        </div>

        <div className="pt-2">
          <p className="font-semibold">Total Estimated (One-time + first month's escrow): ${r.totalEstimatedAtClosing.toFixed(2)}</p>
          <p className="text-sm opacity-70">
            Note: Actual closing statements may include escrow deposits/reserves and other local fees.
          </p>
        </div>
      </div>
    </div>
  );
}
