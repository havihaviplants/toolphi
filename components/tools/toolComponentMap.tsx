// components/tools/toolComponentMap.tsx
import type { ComponentType } from "react";
import StoreProfitCalculator from "./StoreProfitCalculator";
import BreakEvenUnitsCalculator from "./BreakEvenUnitsCalculator";
import RoiCalculator from "./RoiCalculator";
import LoanPaymentCalculator from "./LoanPaymentCalculator";
import MortgageCalculator from "./MortgageCalculator";
import HomeAffordabilityCalculator from "./HomeAffordabilityCalculator";
import AmortizationCalculator from "./AmortizationCalculator";
import RefinanceCalculator from "./RefinanceCalculator";
import LoanCalculator from "./LoanCalculator";
import AprCalculator from "./AprCalculator";
import CarLoanCalculator from "./CarLoanCalculator";
import FhaMortgageCalculator from "./FhaMortgageCalculator";
import AutoLoanPayoffCalculator from "./AutoLoanPayoffCalculator";




// 앞으로 여기다가 새 툴 생길 때마다 import + 매핑만 추가하면 됨
const toolComponentMap: Record<string, ComponentType> = {
  "store-profit": StoreProfitCalculator,
  "breakeven-units": BreakEvenUnitsCalculator,
  "roi-calculator": RoiCalculator,
  "loan-payment": LoanPaymentCalculator, // 🔹 요 줄 추가
  "mortgage-calculator": MortgageCalculator,
  "home-affordability-calculator": HomeAffordabilityCalculator, // 🔹 이 줄 추가
  "amortization-calculator": AmortizationCalculator, // ← 이 줄 추가
  "refinance-calculator": RefinanceCalculator, // 🔹 이 줄
  "loan-calculator": LoanCalculator, // 🔹 이 줄
  "apr-calculator": AprCalculator, // 🔹 이 줄
  "car-loan-calculator": CarLoanCalculator,
  "fha-mortgage-calculator": FhaMortgageCalculator,
  "auto-loan-payoff-calculator": AutoLoanPayoffCalculator,

};

export function getToolComponent(slug: string) {
  return toolComponentMap[slug] ?? null;
}
