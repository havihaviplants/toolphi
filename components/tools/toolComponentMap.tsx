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
import UnderpaymentPenaltyCalculator from "./UnderpaymentPenaltyCalculator";
import EstimatedTaxPaymentCalculator from "./EstimatedTaxPaymentCalculator";
import TakeHomePayCalculator from "./TakeHomePayCalculator";
import HourlyToAfterTaxSalaryCalculator from "./HourlyToAfterTaxSalaryCalculator";
import HowMuchTaxDoIOweCalculator from "./HowMuchTaxDoIOweCalculator";
import TaxRefundEstimator from "./TaxRefundEstimator";
import CreditCardCashAdvanceFeeCalculator from "./CreditCardCashAdvanceFeeCalculator";
import CreditCardCashWithdrawalCostCalculator from "./CreditCardCashWithdrawalCostCalculator";
import CreditCardToBankTransferFeeCalculator from "./CreditCardToBankTransferFeeCalculator";
import CreditCardToDebitCardTransferFeeCalculator from "./CreditCardToDebitCardTransferFeeCalculator";
import CreditCardCashAppTransferFeeCalculator from "./CreditCardCashAppTransferFeeCalculator";
import CreditCardCashWithdrawalInterestCalculator from "./CreditCardCashWithdrawalInterestCalculator";
import CreditCardCashAdvanceInterestPerDayCalculator from "./CreditCardCashAdvanceInterestPerDayCalculator";
import OverdraftFeeCalculator from "./OverdraftFeeCalculator";
import NsfFeeCalculator from "./NsfFeeCalculator";
import AtmFeeCalculator from "./AtmFeeCalculator";
import WireTransferFeeCalculator from "./WireTransferFeeCalculator";
import InternationalMoneyTransferFeeCalculator from "./InternationalMoneyTransferFeeCalculator";
import InternationalWireTransferFeeCalculator from "./InternationalWireTransferFeeCalculator";
import WesternUnionTransferFeeCalculator from "./WesternUnionTransferFeeCalculator";
import BankMaintenanceFeeCalculator from "./BankMaintenanceFeeCalculator";
import InternationalAtmFeeCalculator from "./InternationalAtmFeeCalculator";
import StopPaymentFeeCalculator from "./StopPaymentFeeCalculator";
import InvestmentIncomeTaxCalculator from "./InvestmentIncomeTaxCalculator";
import AfterTaxInvestmentReturnCalculator from "./AfterTaxInvestmentReturnCalculator";
import NetInvestmentReturnCalculator from "./NetInvestmentReturnCalculator";
import NetInvestmentIncomeTaxCalculator from "./NetInvestmentIncomeTaxCalculator";
import AfterTaxROICalculator from "./AfterTaxROICalculator";
import CapitalGainsTaxEstimator from "./CapitalGainsTaxEstimator";
import InvestmentTaxCalculator from "./InvestmentTaxCalculator";
import InvestmentNetProfitCalculator from "./InvestmentNetProfitCalculator";
import NetInvestmentIncomeCalculator from "./NetInvestmentIncomeCalculator";
import PrepaymentPenaltyCalculator from "./PrepaymentPenaltyCalculator";
import EscrowFeeCalculator from "./EscrowFeeCalculator";
import EscrowCostCalculator from "./EscrowCostCalculator";
import EscrowClosingCostCalculator from "./EscrowClosingCostCalculator";
import EscrowFeesBuyerSellerCalculator from "./EscrowFeesBuyerSellerCalculator";
import EscrowAccountFeeCalculator from "./EscrowAccountFeeCalculator";
import MonthlyEscrowPaymentCalculator from "./MonthlyEscrowPaymentCalculator";
import EscrowTaxAndInsuranceCalculator from "./EscrowTaxAndInsuranceCalculator";
import HourlyToSalaryCalculator from "./HourlyToSalaryCalculator";
import SalaryToHourlyCalculator from "./SalaryToHourlyCalculator";
import MonthlySalaryCalculator from "./MonthlySalaryCalculator";
import GrossVsNetSalaryCalculator from "./GrossVsNetSalaryCalculator";
import NetSalaryCalculator from "./NetSalaryCalculator";
import AfterTaxSalaryCalculator from "./AfterTaxSalaryCalculator";
import PaycheckCalculator from "./PaycheckCalculator";
import SalaryPaycheckCalculator from "./SalaryPaycheckCalculator";
import MonthlyTakeHomePayCalculator from "./MonthlyTakeHomePayCalculator";
import SalaryAfterDeductionsCalculator from "./SalaryAfterDeductionsCalculator";
import SalaryTaxCalculator from "./SalaryTaxCalculator";
import SemiMonthlyPaycheckCalculator from "./SemiMonthlyPaycheckCalculator";
import BonusAfterTaxCalculator from "./BonusAfterTaxCalculator";
import LongTermVsShortTermCapitalGainsTaxCalculator from "./LongTermVsShortTermCapitalGainsTaxCalculator";
import CapitalGainsTaxHoldingPeriodCalculator from "./CapitalGainsTaxHoldingPeriodCalculator";
import AfterTaxDividendYieldCalculator from "./AfterTaxDividendYieldCalculator";
import QualifiedVsOrdinaryDividendTaxCalculator from "./QualifiedVsOrdinaryDividendTaxCalculator";
import InvestmentTaxDragCalculator from "./InvestmentTaxDragCalculator";
import EffectiveTaxRateOnInvestmentsCalculator from "./EffectiveTaxRateOnInvestmentsCalculator";
import TaxableVsTaxAdvantagedInvestmentCalculator from "./TaxableVsTaxAdvantagedInvestmentCalculator";
import BeforeVsAfterTaxInvestmentReturnCalculator from "./BeforeVsAfterTaxInvestmentReturnCalculator";
import TaxLossHarvestingBenefitCalculator from "./TaxLossHarvestingBenefitCalculator";
import AfterTaxDividendIncomeCalculator from "./AfterTaxDividendIncomeCalculator";
import DividendReinvestmentDripCalculator from "./DividendReinvestmentDripCalculator";
import ExDividendDateCalculator from "./ExDividendDateCalculator";
import DividendYieldCalculator from "./DividendYieldCalculator";
import DividendPerShareCalculator from "./DividendPerShareCalculator";
import RetirementSavingsCalculator from "./RetirementSavingsCalculator";
import RetirementIncomeCalculator from "./RetirementIncomeCalculator";
import RetirementSpendingCalculator from "./RetirementSpendingCalculator";
import EarlyRetirementCalculator from "./EarlyRetirementCalculator";
import FireRetirementCalculator from "./FireRetirementCalculator";
import K401Calculator from "./401kCalculator";
import RetirementCalculator from "./RetirementCalculator";
import K401ContributionCalculator from "./401kContributionCalculator";
import Roth401kCalculator from "./Roth401kCalculator";
import SepIraCalculator from "./SepIraCalculator";
import SimpleIraCalculator from "./SimpleIraCalculator";
import InsuranceDeductibleCostCalculator from "./InsuranceDeductibleCostCalculator";
import HighVsLowDeductibleInsuranceCalculator from "./HighVsLowDeductibleInsuranceCalculator";
import InsuranceCoverageLevelCostComparisonCalculator from "./InsuranceCoverageLevelCostComparisonCalculator";
import MonthlyVsAnnualInsurancePremiumCalculator from "./MonthlyVsAnnualInsurancePremiumCalculator";
import InsurancePremiumIncreaseImpactCalculator from "./InsurancePremiumIncreaseImpactCalculator";
import HealthInsuranceOutOfPocketCostCalculator from "./HealthInsuranceOutOfPocketCostCalculator";
import FamilyHealthInsuranceCostCalculator from "./FamilyHealthInsuranceCostCalculator";
import HealthInsuranceCopayVsCoinsuranceCalculator from "./HealthInsuranceCopayVsCoinsuranceCalculator";
import HsaCompatibleInsuranceCostCalculator from "./HsaCompatibleInsuranceCostCalculator";
import AutoInsuranceCoverageCostComparisonCalculator from "./AutoInsuranceCoverageCostComparisonCalculator";
import AutoInsuranceCollisionVsComprehensiveCostCalculator from "./AutoInsuranceCollisionVsComprehensiveCostCalculator";
import HomeInsuranceCoverageLimitCalculator from "./HomeInsuranceCoverageLimitCalculator";
import InsuranceVsSelfPayCostCalculator from "./InsuranceVsSelfPayCostCalculator";
import InsuranceClaimBreakEvenCalculator from "./InsuranceClaimBreakEvenCalculator";
import IsInsuranceWorthItCalculator from "./IsInsuranceWorthItCalculator";
import InsuranceCostByAgeCalculator from "./InsuranceCostByAgeCalculator";
import InsuranceCostByUsageCalculator from "./InsuranceCostByUsageCalculator";
import TravelInsuranceCostVsRiskCalculator from "./TravelInsuranceCostVsRiskCalculator";
import TemporaryInsuranceCostEstimator from "./TemporaryInsuranceCostEstimator";
import ShortTermVsAnnualInsuranceCostCalculator from "./ShortTermVsAnnualInsuranceCostCalculator";
import MedicalBillCostCalculator from "./MedicalBillCostCalculator";
import MedicalBillWithoutInsuranceCalculator from "./MedicalBillWithoutInsuranceCalculator";
import SelfPayMedicalCostCalculator from "./SelfPayMedicalCostCalculator";
import OutOfPocketMedicalExpenseCalculator from "./OutOfPocketMedicalExpenseCalculator";
import HospitalVsClinicCostCalculator from "./HospitalVsClinicCostCalculator";
import EmergencyRoomVsUrgentCareCostCalculator from "./EmergencyRoomVsUrgentCareCostCalculator";
import UrgentCareVsClinicCostCalculator from "./UrgentCareVsClinicCostCalculator";
import ErCopayVsCoinsuranceCostCalculator from "./ErCopayVsCoinsuranceCostCalculator";
import MedicalProcedureCostEstimator from "./MedicalProcedureCostEstimator";
import OutOfNetworkMedicalCostCalculator from "./OutOfNetworkMedicalCostCalculator";
import MedicalBillNegotiationSavingsCalculator from "./MedicalBillNegotiationSavingsCalculator";
import PaymentPlanMedicalCostCalculator from "./PaymentPlanMedicalCostCalculator";
import HighDeductibleHealthPlanCostCalculator from "./HighDeductibleHealthPlanCostCalculator";
import MedicalExpenseTaxDeductionCalculator from "./MedicalExpenseTaxDeductionCalculator";
import PrescriptionDrugCostComparisonCalculator from "./PrescriptionDrugCostComparisonCalculator";
import AmbulanceCostCalculator from "./AmbulanceCostCalculator";
import EmergencyRoomCostWithoutInsuranceCalculator from "./EmergencyRoomCostWithoutInsuranceCalculator";
import MedicalDebtInterestCalculator from "./MedicalDebtInterestCalculator";
import MedicalDebtVsCreditCardPayoffCalculator from "./MedicalDebtVsCreditCardPayoffCalculator";
import MedicalBillNegotiationChanceCalculator from "./MedicalBillNegotiationChanceCalculator";
import PennyStockPositionSizeCalculator from "./PennyStockPositionSizeCalculator";
import PennyStockAverageDownCalculator from "./PennyStockAverageDownCalculator";
import PennyStockReverseSplitImpactCalculator from "./PennyStockReverseSplitImpactCalculator";
import PennyStockDilutionImpactCalculator from "./PennyStockDilutionImpactCalculator";
import PennyStockMarketCapCalculator from "./PennyStockMarketCapCalculator";
import MortgagePointsBreakEvenCalculator from "./MortgagePointsBreakEvenCalculator";
import MortgageRateChangeImpactCalculator from "./MortgageRateChangeImpactCalculator";
import RateLockVsFloatCalculator from "./RateLockVsFloatCalculator";
import MortgageRateBuydownCalculator from "./MortgageRateBuydownCalculator";
import ArmRateAdjustmentImpactCalculator from "./ArmRateAdjustmentImpactCalculator";
import FixedVsArmRateDifferenceCalculator from "./FixedVsArmRateDifferenceCalculator";
import RefinanceRateSavingsCalculator from "./RefinanceRateSavingsCalculator";
import QuarterPointRateChangePaymentCalculator from "./QuarterPointRateChangePaymentCalculator";
import EffectiveRateAfterFeesCalculator from "./EffectiveRateAfterFeesCalculator";
import RateVsAprDifferenceCalculator from "./RateVsAprDifferenceCalculator";
import ExchangeRateFeeImpactCalculator from "./ExchangeRateFeeImpactCalculator";
import ExchangeRateSpreadCalculator from "./ExchangeRateSpreadCalculator";
import BankVsMarketExchangeRateCalculator from "./BankVsMarketExchangeRateCalculator";
import ExchangeRateMarkupCalculator from "./ExchangeRateMarkupCalculator";
import RealExchangeRateLossCalculator from "./RealExchangeRateLossCalculator";
import AfterFeeExchangeRateCalculator from "./AfterFeeExchangeRateCalculator";
import CurrencyExchangeTotalCostCalculator from "./CurrencyExchangeTotalCostCalculator";
import InternationalMoneyTransferExchangeRateCalculator from "./InternationalMoneyTransferExchangeRateCalculator";
import TravelMoneyExchangeCashVsCardCalculator from "./TravelMoneyExchangeCashVsCardCalculator";
import ExchangeRateVolatilityImpactCalculator from "./ExchangeRateVolatilityImpactCalculator";
import ExchangeRateConversionCalculator from "./ExchangeRateConversionCalculator";


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
  "underpayment-penalty-calculator": UnderpaymentPenaltyCalculator,
  "estimated-tax-payment-calculator": EstimatedTaxPaymentCalculator,
  "take-home-pay-calculator": TakeHomePayCalculator,
  "hourly-to-after-tax-salary-calculator": HourlyToAfterTaxSalaryCalculator,
  "how-much-tax-do-i-owe-calculator": HowMuchTaxDoIOweCalculator,
  "tax-refund-estimator": TaxRefundEstimator,
  "credit-card-cash-advance-fee-calculator": CreditCardCashAdvanceFeeCalculator,
  "credit-card-cash-withdrawal-cost-calculator": CreditCardCashWithdrawalCostCalculator,
  "credit-card-to-bank-transfer-fee-calculator": CreditCardToBankTransferFeeCalculator,
  "credit-card-to-debit-card-transfer-fee-calculator": CreditCardToDebitCardTransferFeeCalculator,
  "credit-card-cash-app-transfer-fee-calculator": CreditCardCashAppTransferFeeCalculator,
  "credit-card-cash-withdrawal-interest-calculator": CreditCardCashWithdrawalInterestCalculator,
  "credit-card-cash-advance-interest-per-day-calculator": CreditCardCashAdvanceInterestPerDayCalculator,
  "overdraft-fee-calculator": OverdraftFeeCalculator,
  "nsf-fee-calculator": NsfFeeCalculator,
  "atm-fee-calculator": AtmFeeCalculator,
  "wire-transfer-fee-calculator": WireTransferFeeCalculator,
  "international-money-transfer-fee-calculator": InternationalMoneyTransferFeeCalculator,
  "international-wire-transfer-fee-calculator": InternationalWireTransferFeeCalculator,
  "western-union-transfer-fee-calculator": WesternUnionTransferFeeCalculator,
  "bank-maintenance-fee-calculator": BankMaintenanceFeeCalculator,
  "international-atm-fee-calculator": InternationalAtmFeeCalculator,
  "stop-payment-fee-calculator": StopPaymentFeeCalculator,
  "investment-income-tax-calculator": InvestmentIncomeTaxCalculator,
  "after-tax-investment-return-calculator": AfterTaxInvestmentReturnCalculator,
  "net-investment-return-calculator": NetInvestmentReturnCalculator,
  "net-investment-income-tax-calculator": NetInvestmentIncomeTaxCalculator,
  "after-tax-roi-calculator": AfterTaxROICalculator,
  "capital-gains-tax-estimator": CapitalGainsTaxEstimator,
  "investment-tax-calculator": InvestmentTaxCalculator,
  "investment-net-profit-calculator": InvestmentNetProfitCalculator,
  "net-investment-income-calculator": NetInvestmentIncomeCalculator,
  "prepayment-penalty-calculator": PrepaymentPenaltyCalculator,
  "escrow-fee-calculator": EscrowFeeCalculator,
  "escrow-cost-calculator": EscrowCostCalculator,
  "escrow-closing-cost-calculator": EscrowClosingCostCalculator,
  "escrow-fees-buyer-seller": EscrowFeesBuyerSellerCalculator,
  "escrow-account-fee-calculator": EscrowAccountFeeCalculator,
  "monthly-escrow-payment-calculator": MonthlyEscrowPaymentCalculator,
  "escrow-tax-and-insurance-calculator": EscrowTaxAndInsuranceCalculator,
  "hourly-to-salary-calculator": HourlyToSalaryCalculator,
  "salary-to-hourly-calculator": SalaryToHourlyCalculator,
  "monthly-salary-calculator": MonthlySalaryCalculator,
  "gross-vs-net-salary-calculator": GrossVsNetSalaryCalculator,
  "net-salary-calculator": NetSalaryCalculator,
  "after-tax-salary-calculator": AfterTaxSalaryCalculator,
  "paycheck-calculator": PaycheckCalculator,
  "salary-paycheck-calculator": SalaryPaycheckCalculator,
  "monthly-take-home-pay-calculator": MonthlyTakeHomePayCalculator,
  "salary-after-deductions-calculator": SalaryAfterDeductionsCalculator,
  "salary-tax-calculator": SalaryTaxCalculator,
  "semi-monthly-paycheck-calculator": SemiMonthlyPaycheckCalculator,
  "bonus-after-tax-calculator": BonusAfterTaxCalculator,
  "long-term-vs-short-term-capital-gains-tax-calculator": LongTermVsShortTermCapitalGainsTaxCalculator,
  "capital-gains-tax-holding-period-calculator": CapitalGainsTaxHoldingPeriodCalculator,
  "after-tax-dividend-yield-calculator": AfterTaxDividendYieldCalculator,
  "qualified-vs-ordinary-dividend-tax-calculator": QualifiedVsOrdinaryDividendTaxCalculator,
  "investment-tax-drag-calculator": InvestmentTaxDragCalculator,
  "effective-tax-rate-on-investments-calculator": EffectiveTaxRateOnInvestmentsCalculator,
  "taxable-vs-tax-advantaged-investment-calculator": TaxableVsTaxAdvantagedInvestmentCalculator,
  "before-vs-after-tax-investment-return-calculator": BeforeVsAfterTaxInvestmentReturnCalculator,
  "tax-loss-harvesting-benefit-calculator": TaxLossHarvestingBenefitCalculator,
  "after-tax-dividend-income-calculator": AfterTaxDividendIncomeCalculator,
  "dividend-reinvestment-drip-calculator": DividendReinvestmentDripCalculator,
  "ex-dividend-date-calculator": ExDividendDateCalculator,
  "dividend-yield-calculator": DividendYieldCalculator,
  "dividend-per-share-calculator": DividendPerShareCalculator,
  "retirement-savings-calculator": RetirementSavingsCalculator,
  "retirement-income-calculator": RetirementIncomeCalculator,
  "retirement-spending-calculator": RetirementSpendingCalculator,
  "early-retirement-calculator": EarlyRetirementCalculator,
  "fire-retirement-calculator": FireRetirementCalculator,
  "401k-calculator": K401Calculator,
  "retirement-calculator": RetirementCalculator,
  "401k-contribution-calculator": K401ContributionCalculator,
  "roth-401k-calculator": Roth401kCalculator,
  "sep-ira-calculator": SepIraCalculator,
  "simple-ira-calculator": SimpleIraCalculator,
  "insurance-deductible-cost-calculator": InsuranceDeductibleCostCalculator,
  "high-vs-low-deductible-insurance-calculator": HighVsLowDeductibleInsuranceCalculator,
  "insurance-coverage-level-cost-comparison-calculator": InsuranceCoverageLevelCostComparisonCalculator,
  "monthly-vs-annual-insurance-premium-calculator": MonthlyVsAnnualInsurancePremiumCalculator,
  "insurance-premium-increase-impact-calculator": InsurancePremiumIncreaseImpactCalculator,
  "health-insurance-out-of-pocket-cost-calculator": HealthInsuranceOutOfPocketCostCalculator,
  "family-health-insurance-cost-calculator": FamilyHealthInsuranceCostCalculator,
  "health-insurance-copay-vs-coinsurance-calculator": HealthInsuranceCopayVsCoinsuranceCalculator,
  "hsa-compatible-insurance-cost-calculator": HsaCompatibleInsuranceCostCalculator,
  "auto-insurance-coverage-cost-comparison-calculator": AutoInsuranceCoverageCostComparisonCalculator,
  "auto-insurance-collision-vs-comprehensive-cost-calculator": AutoInsuranceCollisionVsComprehensiveCostCalculator,
  "home-insurance-coverage-limit-calculator": HomeInsuranceCoverageLimitCalculator,
  "insurance-vs-self-pay-cost-calculator": InsuranceVsSelfPayCostCalculator,
  "insurance-claim-break-even-calculator": InsuranceClaimBreakEvenCalculator,
  "is-insurance-worth-it-calculator": IsInsuranceWorthItCalculator,
  "insurance-cost-by-age-calculator": InsuranceCostByAgeCalculator,
  "insurance-cost-by-usage-calculator": InsuranceCostByUsageCalculator,
  "travel-insurance-cost-vs-risk-calculator": TravelInsuranceCostVsRiskCalculator,
  "temporary-insurance-cost-estimator": TemporaryInsuranceCostEstimator,
  "short-term-vs-annual-insurance-cost-calculator": ShortTermVsAnnualInsuranceCostCalculator,
  "medical-bill-cost-calculator": MedicalBillCostCalculator,
  "medical-bill-without-insurance-calculator": MedicalBillWithoutInsuranceCalculator,
  "self-pay-medical-cost-calculator": SelfPayMedicalCostCalculator,
  "out-of-pocket-medical-expense-calculator": OutOfPocketMedicalExpenseCalculator,
  "hospital-vs-clinic-cost-calculator": HospitalVsClinicCostCalculator,
  "emergency-room-vs-urgent-care-cost-calculator": EmergencyRoomVsUrgentCareCostCalculator,
  "urgent-care-vs-clinic-cost-calculator": UrgentCareVsClinicCostCalculator,
  "er-copay-vs-coinsurance-cost-calculator": ErCopayVsCoinsuranceCostCalculator,
  "medical-procedure-cost-estimator": MedicalProcedureCostEstimator,
  "out-of-network-medical-cost-calculator": OutOfNetworkMedicalCostCalculator,
  "medical-bill-negotiation-savings-calculator": MedicalBillNegotiationSavingsCalculator,
  "payment-plan-medical-cost-calculator": PaymentPlanMedicalCostCalculator,
  "high-deductible-health-plan-cost-calculator": HighDeductibleHealthPlanCostCalculator,
  "medical-expense-tax-deduction-calculator": MedicalExpenseTaxDeductionCalculator,
  "prescription-drug-cost-comparison-calculator": PrescriptionDrugCostComparisonCalculator,
  "ambulance-cost-calculator": AmbulanceCostCalculator,
  "emergency-room-cost-without-insurance-calculator": EmergencyRoomCostWithoutInsuranceCalculator,
  "medical-debt-interest-calculator": MedicalDebtInterestCalculator,
  "medical-debt-vs-credit-card-payoff-calculator": MedicalDebtVsCreditCardPayoffCalculator,
  "medical-bill-negotiation-chance-calculator": MedicalBillNegotiationChanceCalculator,
  "penny-stock-position-size-calculator": PennyStockPositionSizeCalculator,
  "penny-stock-average-down-calculator": PennyStockAverageDownCalculator,
  "penny-stock-reverse-split-impact-calculator": PennyStockReverseSplitImpactCalculator,
  "penny-stock-dilution-impact-calculator": PennyStockDilutionImpactCalculator,
  "penny-stock-market-cap-calculator": PennyStockMarketCapCalculator,
  "mortgage-points-break-even-calculator": MortgagePointsBreakEvenCalculator,
  "mortgage-rate-change-impact-calculator": MortgageRateChangeImpactCalculator,
  "rate-lock-vs-float-calculator": RateLockVsFloatCalculator,
  "mortgage-rate-buydown-calculator": MortgageRateBuydownCalculator,
  "arm-rate-adjustment-impact-calculator": ArmRateAdjustmentImpactCalculator,
  "fixed-vs-arm-rate-difference-calculator": FixedVsArmRateDifferenceCalculator,
  "refinance-rate-savings-calculator": RefinanceRateSavingsCalculator,
  "0-25-percent-rate-change-payment-calculator": QuarterPointRateChangePaymentCalculator,
  "effective-rate-after-fees-calculator": EffectiveRateAfterFeesCalculator,
  "rate-vs-apr-difference-calculator": RateVsAprDifferenceCalculator,
  "exchange-rate-fee-impact-calculator": ExchangeRateFeeImpactCalculator,
  "exchange-rate-spread-calculator": ExchangeRateSpreadCalculator,
  "bank-vs-market-exchange-rate-calculator": BankVsMarketExchangeRateCalculator,
  "exchange-rate-markup-calculator": ExchangeRateMarkupCalculator,
  "real-exchange-rate-loss-calculator": RealExchangeRateLossCalculator,
  "after-fee-exchange-rate-calculator": AfterFeeExchangeRateCalculator,
  "currency-exchange-total-cost-calculator": CurrencyExchangeTotalCostCalculator,
  "international-money-transfer-exchange-rate-calculator": InternationalMoneyTransferExchangeRateCalculator,
  "travel-money-exchange-cash-vs-card-calculator": TravelMoneyExchangeCashVsCardCalculator,
  "exchange-rate-volatility-impact-calculator": ExchangeRateVolatilityImpactCalculator,
  "exchange-rate-conversion-calculator": ExchangeRateConversionCalculator,








};

export function getToolComponent(slug: string) {
  return toolComponentMap[slug] ?? null;
}
