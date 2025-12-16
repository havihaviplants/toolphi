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
import EffectiveMonthlyInterestRateCalculator from "./EffectiveMonthlyInterestRateCalculator";
import InterestOnlyLoanCostCalculator from "./InterestOnlyLoanCostCalculator";
import LoanPayoffTimeCalculator from "./LoanPayoffTimeCalculator";
import DownPaymentCalculator from "./DownPaymentCalculator";
import LoanInterestCalculator from "./LoanInterestCalculator";
import PrincipalInterestPaymentCalculator from "./PrincipalInterestPaymentCalculator";
import MortgageExtraPaymentCalculator from "./MortgageExtraPaymentCalculator";
import AdditionalPrincipalPaymentCalculator from "./AdditionalPrincipalPaymentCalculator";
import AmortizationScheduleWithExtraPaymentsCalculator from "./AmortizationScheduleWithExtraPaymentsCalculator";
import BalloonLoanCalculator from "./BalloonLoanCalculator";
import BalloonMortgageCalculator from "./BalloonMortgageCalculator";
import AmortizationScheduleWithBalloonPayment from "./AmortizationScheduleWithBalloonPayment";
import SbaLoanPaymentCalculator from "./SbaLoanPaymentCalculator";
import HomeLoanRepaymentsCalculator from "./HomeLoanRepaymentsCalculator";
import CarLoanRepaymentsCalculator from "./CarLoanRepaymentsCalculator";
import EducationLoanRepaymentCalculator from "./EducationLoanRepaymentCalculator";
import ParentPlusLoanRepaymentCalculator from "./ParentPlusLoanRepaymentCalculator";
import PersonalLoanPaymentCalculator from "./PersonalLoanPaymentCalculator";
import LoanDefermentInterestCalculator from "./LoanDefermentInterestCalculator";
import UsdaLoanPaymentCalculator from "./UsdaLoanPaymentCalculator";
import IncomeDrivenRepaymentCalculator from "./IncomeDrivenRepaymentCalculator";
import IDRPlanComparisonCalculator from "./IDRPlanComparisonCalculator";
import IDREligibilityChecklist from "./IDREligibilityChecklist";
import FederalStudentLoanCalculator from "./FederalStudentLoanCalculator";
import StudentLoanConsolidationCalculator from "./StudentLoanConsolidationCalculator";
import StudentLoanAprCalculator from "./StudentLoanAprCalculator";
import StudentLoanRefinanceSavingsCalculator from "./StudentLoanRefinanceSavingsCalculator";
import PslfForgivenessEstimator from "./PslfForgivenessEstimator";
import StudentLoanForgivenessCalculator from "./StudentLoanForgivenessCalculator";
import SavePlanCalculator from "./SavePlanCalculator";
import PayePlanCalculator from "./PayePlanCalculator";
import IcrPlanCalculator from "./IcrPlanCalculator";
import IbrPlanCalculator from "./IbrPlanCalculator";
import AnnualFeeBreakEvenCalculator from "./AnnualFeeBreakEvenCalculator";
import CashbackValueCalculator from "./CashbackValueCalculator";
import PointsToCashValueCalculator from "./PointsToCashValueCalculator";
import TravelRewardsValueCalculator from "./TravelRewardsValueCalculator";
import ForeignTransactionFeeSavingsCalculator from "./ForeignTransactionFeeSavingsCalculator";
import CreditCardAPRSavingsCalculator from "./CreditCardAPRSavingsCalculator";
import CapitalGainsTaxCalculator from "./CapitalGainsTaxCalculator";
import SelfEmploymentTaxCalculator from "./SelfEmploymentTaxCalculator";
import SalaryAfterTaxCalculator from "./SalaryAfterTaxCalculator";
import QuarterlyEstimatedTaxCalculator from "./QuarterlyEstimatedTaxCalculator";
import ShortTermCapitalGainsTaxCalculator from "./ShortTermCapitalGainsTaxCalculator";
import LongTermCapitalGainsTaxCalculator from "./LongTermCapitalGainsTaxCalculator";
import StockSaleTaxCalculator from "./StockSaleTaxCalculator";
import CryptoTaxCalculator from "./CryptoTaxCalculator";
import DividendTaxCalculator from "./DividendTaxCalculator";
import Tax1099Calculator from "./Tax1099Calculator";
import FreelancerTaxCalculator from "./FreelancerTaxCalculator";




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
  "effective-monthly-interest-rate-calculator": EffectiveMonthlyInterestRateCalculator,
  "interest-only-loan-cost-calculator": InterestOnlyLoanCostCalculator,
  "loan-payoff-time-calculator": LoanPayoffTimeCalculator,
  "down-payment-calculator": DownPaymentCalculator,
  "loan-interest-calculator": LoanInterestCalculator,
  "principal-interest-payment-calculator": PrincipalInterestPaymentCalculator,
  "mortgage-extra-payment-calculator": MortgageExtraPaymentCalculator,
  "additional-principal-payment-calculator": AdditionalPrincipalPaymentCalculator,
  "amortization-schedule-with-extra-payments": AmortizationScheduleWithExtraPaymentsCalculator,
  "balloon-loan-calculator": BalloonLoanCalculator,
  "balloon-mortgage-calculator": BalloonMortgageCalculator,
  "amortization-schedule-with-balloon-payment": AmortizationScheduleWithBalloonPayment,
  "sba-loan-payment-calculator": SbaLoanPaymentCalculator,
  "home-loan-repayments-calculator": HomeLoanRepaymentsCalculator,
  "car-loan-repayments-calculator": CarLoanRepaymentsCalculator,
  "education-loan-repayment-calculator": EducationLoanRepaymentCalculator,
  "parent-plus-loan-repayment-calculator": ParentPlusLoanRepaymentCalculator,
  "personal-loan-payment-calculator": PersonalLoanPaymentCalculator,
  "loan-deferment-interest-calculator": LoanDefermentInterestCalculator,
  "usda-loan-payment-calculator": UsdaLoanPaymentCalculator,
  "income-driven-repayment-calculator": IncomeDrivenRepaymentCalculator,
  "idr-plan-comparison-calculator": IDRPlanComparisonCalculator,
  "idr-eligibility-checklist": IDREligibilityChecklist,
  "federal-student-loan-calculator": FederalStudentLoanCalculator,
  "student-loan-consolidation-calculator": StudentLoanConsolidationCalculator,
  "student-loan-apr-calculator": StudentLoanAprCalculator,
  "student-loan-refinance-savings-calculator": StudentLoanRefinanceSavingsCalculator,
  "pslf-forgiveness-estimator": PslfForgivenessEstimator,
  "student-loan-forgiveness-calculator": StudentLoanForgivenessCalculator,
  "save-plan-calculator": SavePlanCalculator,
  "paye-plan-calculator": PayePlanCalculator,
  "icr-plan-calculator": IcrPlanCalculator,
  "ibr-plan-calculator": IbrPlanCalculator,
  "annual-fee-break-even-calculator": AnnualFeeBreakEvenCalculator,
  "cashback-value-calculator": CashbackValueCalculator,
  "points-to-cash-value-calculator": PointsToCashValueCalculator,
  "travel-rewards-value-calculator": TravelRewardsValueCalculator,
  "foreign-transaction-fee-savings-calculator": ForeignTransactionFeeSavingsCalculator,
  "credit-card-apr-savings-calculator": CreditCardAPRSavingsCalculator,
  "capital-gains-tax-calculator": CapitalGainsTaxCalculator,
  "self-employment-tax-calculator": SelfEmploymentTaxCalculator,
  "salary-after-tax-calculator": SalaryAfterTaxCalculator,
  "quarterly-estimated-tax-calculator": QuarterlyEstimatedTaxCalculator,
  "short-term-capital-gains-tax-calculator": ShortTermCapitalGainsTaxCalculator,
  "long-term-capital-gains-tax-calculator": LongTermCapitalGainsTaxCalculator,
  "stock-sale-tax-calculator": StockSaleTaxCalculator,
  "crypto-tax-calculator": CryptoTaxCalculator,
  "dividend-tax-calculator": DividendTaxCalculator,
  "1099-tax-calculator": Tax1099Calculator,
  "freelancer-tax-calculator": FreelancerTaxCalculator,

};

export function getToolComponent(slug: string) {
  return toolComponentMap[slug] ?? null;
}
