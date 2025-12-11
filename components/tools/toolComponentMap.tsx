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
import SimpleInterestCalculator from "./SimpleInterestCalculator";
import DtiCalculator from "./DtiCalculator";
import PmiCalculator from "./PmiCalculator";
import RentVsBuyCalculator from "./RentVsBuyCalculator";
import ArmMortgageCalculator from "./ArmMortgageCalculator";
import LtvCalculator from "./LtvCalculator";
import MortgageComparisonCalculator from "./MortgageComparisonCalculator";
import CompoundInterestCalculator from "./CompoundInterestCalculator";
import CreditCardPayoffCalculator from "./CreditCardPayoffCalculator";
import DebtSnowballCalculator from "./DebtSnowballCalculator";
import BiweeklyMortgageCalculator from "./BiweeklyMortgageCalculator";
import AutoLoanRefinanceCalculator from "./AutoLoanRefinanceCalculator";
import SavingsGoalCalculator from "./SavingsGoalCalculator";
import DebtAvalancheCalculator from "./DebtAvalancheCalculator";
import BalanceTransferCalculator from "./BalanceTransferCalculator";
import TotalLoanCostCalculator from "./TotalLoanCostCalculator";
import HelocCalculator from "./HelocCalculator";
import StudentLoanPaymentCalculator from "./StudentLoanPaymentCalculator";
import LatePaymentInterestCalculator from "./LatePaymentInterestCalculator";
import IncomeBasedRepaymentCalculator from "./IncomeBasedRepaymentCalculator";
import CarLoanInterestRateCalculator from "./CarLoanInterestRateCalculator";
import MortgagePaymentFrequencyCalculator from "./MortgagePaymentFrequencyCalculator";
import LoanTermComparisonCalculator from "./LoanTermComparisonCalculator";
import StudentLoanInterestSavingsCalculator from "./StudentLoanInterestSavingsCalculator";




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
  "simple-interest-calculator": SimpleInterestCalculator,
  "dti-calculator": DtiCalculator,
  "pmi-calculator": PmiCalculator,
  "rent-vs-buy": RentVsBuyCalculator,
  "arm-mortgage-calculator": ArmMortgageCalculator,
  "ltv-calculator": LtvCalculator,
  "mortgage-comparison": MortgageComparisonCalculator,
  "compound-interest-calculator": CompoundInterestCalculator, // 🔹 이 줄 추가
  "credit-card-payoff-calculator": CreditCardPayoffCalculator, // 🔹 이 줄 추가
  "debt-snowball-calculator": DebtSnowballCalculator, // 🔹 이 줄 추가
  "biweekly-mortgage-calculator": BiweeklyMortgageCalculator, // 🔹 이 줄 추가
  "auto-loan-refinance-calculator": AutoLoanRefinanceCalculator, // 🔹 추가
  "savings-goal-calculator": SavingsGoalCalculator, // 🔹 추가
  "debt-avalanche-calculator": DebtAvalancheCalculator, // 🔹 추가
  "balance-transfer-calculator": BalanceTransferCalculator, // 🔹 추가
  "total-loan-cost-calculator": TotalLoanCostCalculator, // 🔹 추가
  "heloc-calculator": HelocCalculator, // 🔹 추가
  "student-loan-payment-calculator": StudentLoanPaymentCalculator,
  "late-payment-interest-calculator": LatePaymentInterestCalculator,
  "income-based-repayment-calculator": IncomeBasedRepaymentCalculator,
  "car-loan-interest-rate-calculator": CarLoanInterestRateCalculator,
  "mortgage-payment-frequency-calculator": MortgagePaymentFrequencyCalculator,
  "loan-term-comparison-calculator": LoanTermComparisonCalculator,
  "student-loan-interest-savings-calculator": StudentLoanInterestSavingsCalculator,

};

export function getToolComponent(slug: string) {
  return toolComponentMap[slug] ?? null;
}
