// data/tools.ts
import type { CategoryId } from "./categories";

export type ToolType = "calculator" | "converter" | "analyzer";

export interface Tool {
  slug: string;
  category: CategoryId;
  title: string;
  description: string;
  keywords: string[];
  type: ToolType;
  // 연관 툴 추천용 의미 태그
  tags?: string[];

   // 🔽 새로 추가
  howToSteps?: string[];
  example?: {
    description: string;
    bullets: string[];
  };

}

export const tools: Tool[] = [
  {
    slug: "store-profit",
    category: "finance",
    title: "Store Profit Calculator",
    description:
      "Calculate net profit, margin and break-even point for your store.",
    keywords: ["store profit", "margin calculator", "net profit"],
    type: "calculator",
    tags: ["profit", "margin", "store", "business"],
    howToSteps: [
      "Enter your monthly total store revenue.",
      "Set your average COGS rate (%).",
      "Fill in fixed costs like rent, payroll, and other recurring expenses.",
      "Click Calculate to see gross profit, net profit, margin, and break-even revenue.",
    ],
    example: {
      description:
        "Suppose your store makes $30,000 per month in revenue and your COGS rate is 60% with fixed costs (rent, payroll, others). This tool helps you understand:",
      bullets: [
        "Gross profit after COGS.",
        "Net profit after all fixed costs.",
        "Net profit margin (%).",
        "Monthly break-even revenue level.",
      ],
    },
  },
  {
    slug: "breakeven-units",
    category: "finance",
    title: "Break-even Units Calculator",
    description:
      "Calculate the number of units you need to sell to cover your fixed and variable costs.",
    keywords: [
      "break even",
      "breakeven units",
      "fixed cost",
      "contribution margin",
    ],
    type: "calculator",
    tags: ["break-even", "units", "cost", "store", "business"],
    howToSteps: [
      "Enter your total fixed costs (rent, salaries, insurance, etc.).",
      "Enter the selling price per unit.",
      "Enter the variable cost per unit (materials, packaging, shipping, etc.).",
      "Click Calculate to see how many units you need to sell to break even.",
    ],
    example: {
      description:
        "Imagine your monthly fixed costs are $10,000, selling price is $50, and variable cost per unit is $20. This calculator shows:",
      bullets: [
        "The exact number of units you must sell to break even.",
        "How changes in price or variable cost affect your break-even point.",
        "Whether your current sales target is above or below break-even.",
      ],
    },
  },
  {
    slug: "roi-calculator",
    category: "finance",
    title: "ROI Calculator",
    description:
      "Calculate return on investment (ROI) based on your initial investment and final value.",
    keywords: ["roi", "return on investment", "investment calculator"],
    type: "calculator",
    tags: ["roi", "investment", "return", "business"],
    howToSteps: [
      "Enter your initial investment amount.",
      "Enter the final value (current value or total return).",
      "Click Calculate ROI to see your return as a percentage.",
      "Use the percentage to compare different projects or campaigns.",
    ],
    example: {
      description:
        "If you spent $5,000 on a marketing campaign and it generated $8,500 in additional profit, this calculator helps you see:",
      bullets: [
        "Your ROI percentage for the campaign.",
        "How this ROI compares with other investments.",
        "Whether it makes sense to scale or repeat this campaign.",
      ],
    },
  },
  {
    slug: "loan-payment",
    category: "finance",
    title: "Loan Payment Calculator",
    description: "Calculate monthly payment for a fixed-rate loan.",
    keywords: ["loan calculator", "monthly payment", "loan payment", "finance"],
    type: "calculator",
    tags: ["loan", "payment", "interest", "amortization"],
    howToSteps: [
      "Enter the total loan amount.",
      "Enter the annual interest rate (APR).",
      "Enter the loan term in years.",
      "Click Calculate to see monthly payment, total payment, and total interest.",
    ],
    example: {
      description:
        "For a $20,000 loan at 6% over 5 years, this calculator shows:",
      bullets: [
        "Your monthly payment amount.",
        "Total amount repaid over the loan term.",
        "Total interest cost.",
      ],
    },
  },
  {
    slug: "mortgage-calculator",
    category: "finance",
    title: "Mortgage Calculator",
    description:
      "Estimate your monthly mortgage payment based on loan amount, interest rate, and term.",
    keywords: [
      "mortgage calculator",
      "home loan calculator",
      "monthly mortgage payment",
      "home loan",
    ],
    type: "calculator",
    tags: ["mortgage", "loan", "housing", "amortization"],
    howToSteps: [
      "Enter the total mortgage loan amount.",
      "Enter the annual interest rate (APR).",
      "Enter the mortgage term in years (e.g. 30).",
      "Click Calculate to see monthly payment, total payment, and total interest.",
    ],
    example: {
      description:
        "For a $300,000 mortgage at 4.5% over 30 years, this calculator helps you understand:",
      bullets: [
        "Your monthly mortgage payment.",
        "Total amount paid over 30 years.",
        "Total interest cost of the mortgage.",
      ],
    },
  },
    {
    slug: "home-affordability-calculator",
    category: "finance",
    title: "Home Affordability Calculator",
    description:
      "Estimate how much house you can afford based on your income, debts, and loan terms.",
    keywords: [
      "home affordability calculator",
      "how much house can I afford",
      "mortgage affordability",
      "house budget",
      "DTI calculator",
    ],
    type: "calculator",
    tags: ["mortgage", "home", "affordability", "DTI", "budget"],
    howToSteps: [
      "Enter your gross annual income before taxes.",
      "Enter your total monthly debt payments (credit cards, car loans, student loans, etc.).",
      "Enter the down payment you can make, along with the expected mortgage interest rate and term.",
      "Click Calculate to see the maximum home price, loan amount, and estimated monthly mortgage payment you can afford.",
    ],
    example: {
      description:
        "Imagine you earn $90,000 per year, pay $600 per month on other debts, have $60,000 saved for a down payment, and expect a 6% mortgage over 30 years. This calculator helps you understand:",
      bullets: [
        "The maximum monthly mortgage payment that keeps your debt-to-income ratio in a healthy range.",
        "The maximum loan amount you can reasonably qualify for.",
        "An estimated maximum home price you should target with your budget.",
        "Your resulting debt-to-income (DTI) ratio after the mortgage payment.",
      ],
    },
  },
    {
    slug: "amortization-calculator",
    category: "finance",
    title: "Amortization Calculator",
    description:
      "Generate a full amortization schedule with monthly principal and interest breakdown.",
    keywords: [
      "amortization calculator",
      "loan amortization schedule",
      "mortgage amortization",
      "principal and interest breakdown",
      "loan payoff schedule",
    ],
    type: "calculator",
    tags: ["mortgage", "loan", "amortization", "schedule", "payoff"],
    howToSteps: [
      "Enter your total loan amount (principal).",
      "Enter the annual interest rate for your loan.",
      "Enter the loan term in years.",
      "Optionally, enter an extra monthly payment to see how much faster you can pay off the loan.",
      "Click Calculate to generate a monthly amortization schedule with principal, interest, and remaining balance.",
    ],
    example: {
      description:
        "For example, suppose you have a $300,000 mortgage at 6% interest over 30 years, and you add a $200 extra monthly payment. This calculator will show you:",
      bullets: [
        "Your standard monthly payment based on the principal, rate, and term.",
        "How much of each payment goes to interest vs principal over time.",
        "The total interest paid over the life of the loan.",
        "How many months earlier you can pay off the loan with your extra monthly payment.",
      ],
    },
  },

    {
    slug: "refinance-calculator",
    category: "finance",
    title: "Refinance Calculator",
    description:
      "Compare your current mortgage with a new refinance offer and see monthly savings, total interest saved, and breakeven point.",
    keywords: [
      "refinance calculator",
      "mortgage refinance",
      "refi savings",
      "refinance breakeven",
      "refinance vs current loan",
    ],
    type: "calculator",
    tags: ["mortgage", "refinance", "interest", "savings", "breakeven"],
    howToSteps: [
      "Enter your remaining loan balance on the current mortgage.",
      "Enter your current interest rate and the remaining term in years.",
      "Enter the new refinance interest rate and the new term in years.",
      "Add estimated closing costs for the refinance (if any).",
      "Click Calculate to see the new payment, monthly savings, total interest saved, and how many months it takes to break even on closing costs.",
    ],
    example: {
      description:
        "For example, suppose you owe $280,000 on your current mortgage at 6.5% with 25 years left. A lender offers a refinance at 5.5% for a new 25-year term with $4,000 in closing costs. This calculator will show you:",
      bullets: [
        "Your current monthly payment vs the new refinanced monthly payment.",
        "Your monthly savings (or loss) from refinancing.",
        "Total interest saved over the life of the new loan compared with keeping your current mortgage.",
        "How many months it takes for your monthly savings to cover the closing costs (the breakeven point).",
      ],
    },
  },

    {
    slug: "loan-calculator",
    category: "finance",
    title: "Loan Calculator",
    description:
      "Calculate monthly payment, total interest, and total cost for a fixed-rate loan.",
    keywords: [
      "loan calculator",
      "monthly payment calculator",
      "loan interest",
      "personal loan calculator",
      "installment loan calculator",
    ],
    type: "calculator",
    tags: ["loan", "payment", "interest", "installment", "finance"],
    howToSteps: [
      "Enter the total loan amount you plan to borrow.",
      "Enter the annual interest rate for the loan.",
      "Enter the loan term in years or months.",
      "Optionally, add any extra monthly payment you want to pay on top of the required payment.",
      "Click Calculate to see your monthly payment, total interest, total paid, and estimated payoff time.",
    ],
    example: {
      description:
        "For example, suppose you borrow $20,000 at 8% interest for 5 years and add a $50 extra monthly payment. This calculator will show you:",
      bullets: [
        "Your required monthly payment based on the principal, rate, and term.",
        "How much interest you will pay over the full life of the loan.",
        "The total amount repaid (principal plus interest).",
        "How much faster you can pay off the loan with your extra monthly payment.",
      ],
    },
  },

    {
    slug: "apr-calculator",
    category: "finance",
    title: "APR Calculator",
    description:
      "Estimate the annual percentage rate (APR) for a loan, including upfront fees and closing costs.",
    keywords: [
      "apr calculator",
      "annual percentage rate",
      "loan apr",
      "mortgage apr",
      "loan fees calculator",
    ],
    type: "calculator",
    tags: ["loan", "apr", "interest", "fees", "finance"],
    howToSteps: [
      "Enter the loan amount you will receive from the lender.",
      "Enter the nominal annual interest rate for the loan.",
      "Enter the term of the loan in years.",
      "Enter any upfront fees or closing costs you pay at the start of the loan.",
      "Click Calculate to see the estimated APR, which reflects the interest rate plus the impact of fees over the life of the loan.",
    ],
    example: {
      description:
        "For example, suppose you take a $20,000 loan at 8% interest for 5 years with $600 in upfront fees. This calculator will show you:",
      bullets: [
        "Your standard monthly payment based on the nominal interest rate and term.",
        "An estimated APR that is higher than 8% because it includes the impact of the $600 fees.",
        "How APR changes if you increase or decrease fees or change the term length.",
        "A better comparison metric when you are choosing between different loan offers.",
      ],
    },
  },

  {
  slug: "car-loan-calculator",
  category: "finance",
  title: "Car Loan Calculator",
  description:
    "Estimate your monthly car loan payment based on vehicle price, down payment, interest rate, and loan term.",
  keywords: [
    "car loan calculator",
    "auto loan calculator",
    "car payment calculator",
    "vehicle finance calculator",
  ],
  type: "calculator",
  tags: ["car", "auto loan", "vehicle", "payment", "finance"],
  howToSteps: [
    "Enter the car price or the total purchase price of the vehicle.",
    "Enter the down payment you plan to pay upfront (if any).",
    "Enter the annual interest rate for your car loan.",
    "Enter the loan term in years.",
    "Click Calculate to see the estimated loan amount, monthly payment, total interest, and total amount paid over the life of the loan.",
  ],
  example: {
    description:
      "For example, suppose you buy a car for $30,000, pay $5,000 down, take a 5-year loan at 5.5% interest. This calculator will show you:",
    bullets: [
      "Your effective loan amount after subtracting the $5,000 down payment.",
      "Your estimated monthly car payment based on the interest rate and term.",
      "The total interest you will pay over the 5-year loan.",
      "The total amount you will have paid for the car including principal and interest.",
    ],
  },
},

{
  slug: "fha-mortgage-calculator",
  category: "finance",
  title: "FHA Mortgage Calculator",
  description:
    "Estimate your monthly FHA mortgage payment including principal, interest, and FHA mortgage insurance (MIP).",
  keywords: [
    "fha mortgage calculator",
    "fha loan payment",
    "fha mip calculator",
    "low down payment mortgage",
    "fha home loan",
  ],
  type: "calculator",
  tags: ["mortgage", "FHA", "MIP", "home loan", "housing"],
  howToSteps: [
    "Enter the home price you want to buy.",
    "Enter your down payment percentage. FHA loans typically allow as low as 3.5%.",
    "Enter the annual interest rate and loan term in years.",
    "Optionally adjust the upfront and annual MIP rates if you know your FHA terms.",
    "Click Calculate to see your estimated monthly payment including principal, interest, and mortgage insurance.",
  ],
  example: {
    description:
      "For example, suppose you buy a $350,000 home with 3.5% down, a 6.25% interest rate, and a 30-year FHA loan. This calculator will show you:",
    bullets: [
      "Your base FHA loan amount after the 3.5% down payment.",
      "Your adjusted loan amount including upfront MIP.",
      "Your estimated monthly principal and interest payment.",
      "Your estimated monthly FHA mortgage insurance, and the total monthly payment including MIP.",
    ],
  },
},

{
  slug: "auto-loan-payoff-calculator",
  category: "finance",
  title: "Auto Loan Payoff Calculator",
  description:
    "See how long it will take to pay off your auto loan and how much interest you will pay, with or without extra monthly payments.",
  keywords: [
    "auto loan payoff calculator",
    "car loan payoff calculator",
    "pay off car early",
    "auto loan term",
    "car payoff date",
  ],
  type: "calculator",
  tags: ["car", "auto loan", "payoff", "debt", "interest"],
  howToSteps: [
    "Enter your current auto loan balance.",
    "Enter your annual interest rate for the loan.",
    "Enter your current monthly payment amount.",
    "Optionally enter an extra monthly payment if you plan to pay more than the required amount.",
    "Click Calculate to see how many months it will take to pay off the loan and how much interest you will pay in total.",
  ],
  example: {
    description:
      "For example, suppose you owe $18,000 on your car, your rate is 7%, and you pay $380 per month. This calculator will show you:",
    bullets: [
      "How many months it will take to pay off the loan at your current payment.",
      "The total interest you will pay until payoff.",
      "How the payoff time and total interest change if you add $50–$100 in extra monthly payments.",
      "Your estimated payoff month and year so you can plan around it.",
    ],
  },
},

{
  slug: "simple-interest-calculator",
  category: "finance",
  title: "Simple Interest Calculator",
  description:
    "Calculate simple interest on a loan or investment based on principal, rate, and time.",
  keywords: [
    "simple interest calculator",
    "interest calculator",
    "loan interest",
    "investment interest",
    "principal rate time",
  ],
  type: "calculator",
  tags: ["interest", "simple interest", "loan", "investment", "math"],
  howToSteps: [
    "Enter the principal amount (starting balance).",
    "Enter the annual interest rate as a percentage.",
    "Enter the time period in years (or decimal years, e.g. 1.5 years).",
    "Click Calculate to see the interest earned or paid and the total amount after interest.",
  ],
  example: {
    description:
      "For example, suppose you invest $5,000 at 6% simple interest for 3 years. This calculator will show you:",
    bullets: [
      "The total simple interest earned over the 3-year period.",
      "The total amount you will have at the end (principal + interest).",
      "How the result changes if you adjust the rate or time period.",
      "A quick way to compare simple-interest loans or investments.",
    ],
  },
},

{
  slug: "dti-calculator",
  category: "finance",
  title: "Debt-to-Income (DTI) Ratio Calculator",
  description:
    "Calculate your DTI ratio to see if you qualify for a mortgage or loan based on your income and monthly debt payments.",
  keywords: [
    "dti calculator",
    "debt to income ratio",
    "mortgage qualification",
    "loan approval calculator",
    "debt ratio calculator"
  ],
  type: "calculator",
  tags: ["mortgage", "loan", "dti", "debt", "income", "finance"],

  howToSteps: [
    "Enter your total monthly gross income (before taxes).",
    "Enter all monthly debt payments: credit cards, auto loans, student loans, etc.",
    "Click Calculate to compute your DTI ratio.",
    "Compare your DTI to typical lender requirements for mortgages and loans."
  ],

  example: {
    description:
      "For example, if your gross monthly income is $6,000 and your monthly debt payments total $1,500, this calculator will show:",
    bullets: [
      "Your exact DTI percentage.",
      "Whether your DTI is acceptable for most mortgage lenders.",
      "How adjusting income or reducing debt affects your qualification chances.",
      "A clear breakdown of debt categories contributing to the ratio."
    ]
  }
},

{
  slug: "pmi-calculator",
  category: "finance",
  title: "PMI Calculator",
  description:
    "Estimate your monthly PMI payment based on loan amount, down payment, credit score, and home value.",
  keywords: [
    "pmi calculator",
    "private mortgage insurance",
    "mortgage insurance calculator",
    "pmi cost",
    "mortgage pmi"
  ],
  type: "calculator",
  tags: ["mortgage", "pmi", "insurance", "loan", "home"],
  
  howToSteps: [
    "Enter the home's purchase price.",
    "Enter your down payment amount or down payment percentage.",
    "Enter the loan term and interest rate.",
    "Enter your estimated PMI rate (typical range: 0.3%–1.5%).",
    "Click Calculate to see your monthly PMI cost and how it affects your total mortgage payment."
  ],

  example: {
    description:
      "For example, if you buy a $400,000 home with 10% down and a PMI rate of 0.8%, this calculator will show:",
    bullets: [
      "The monthly PMI payment added on top of your mortgage.",
      "How PMI changes based on down payment percentage.",
      "How much total PMI you’ll pay until you reach 20% equity.",
      "Why lenders charge PMI and when it can be removed."
    ]
  }
},

{
  slug: "rent-vs-buy",
  category: "finance",
  title: "Rent vs Buy Calculator",
  description:
    "Compare the cost of renting versus buying a home based on your rent, home price, down payment, and mortgage terms.",
  keywords: [
    "rent vs buy calculator",
    "rent vs buy",
    "should I rent or buy",
    "home buying calculator",
    "house rent or buy"
  ],
  type: "calculator",
  tags: ["mortgage", "rent", "home", "real estate", "decision"],

  howToSteps: [
    "Enter your current monthly rent.",
    "Enter the home's price and your planned down payment.",
    "Enter the mortgage interest rate and term.",
    "Optionally, enter monthly property tax, insurance, and HOA fees.",
    "Click Calculate to compare your estimated monthly owning cost with your rent."
  ],

  example: {
    description:
      "For example, if you currently pay $2,000 in rent and you are considering buying a $400,000 home with 10% down at 6.5% interest, this calculator will show:",
    bullets: [
      "Your estimated monthly mortgage payment (principal + interest).",
      "Estimated monthly ownership cost including tax, insurance, and HOA.",
      "Whether renting or buying is cheaper on a monthly basis.",
      "How sensitive the result is to changes in down payment, rate, or extra costs."
    ]
  }
},

{
  slug: "arm-mortgage-calculator",
  category: "finance",
  title: "ARM Mortgage Calculator",
  description:
    "Estimate your monthly payment during the introductory ARM period and after the rate adjusts.",
  keywords: [
    "arm mortgage calculator",
    "adjustable rate mortgage",
    "arm payment",
    "intro rate mortgage",
    "mortgage calculator arm"
  ],
  type: "calculator",
  tags: ["mortgage", "arm", "adjustable rate", "home loan"],

  howToSteps: [
    "Enter the loan amount you plan to borrow.",
    "Enter the introductory interest rate and how many years that intro rate will last.",
    "Enter the interest rate after the adjustment period and the total loan term in years.",
    "Click Calculate to see your estimated monthly payment during the intro period and after the rate adjusts."
  ],

  example: {
    description:
      "For example, if you borrow $400,000 with a 5-year ARM at 4.5% that adjusts to 7.0% afterward on a 30-year term, this calculator will show:",
    bullets: [
      "Your monthly payment during the first 5 years at the intro rate.",
      "The remaining principal at the end of the intro period.",
      "Your new monthly payment after the rate adjusts to 7.0%.",
      "How much more you’ll pay per month after the adjustment, helping you decide if an ARM fits your risk tolerance."
    ]
  }
},

{
  slug: "ltv-calculator",
  category: "finance",
  title: "Loan-to-Value (LTV) Calculator",
  description:
    "Calculate your loan-to-value (LTV) ratio to see how much of the property value is financed by a loan.",
  keywords: [
    "ltv calculator",
    "loan to value",
    "mortgage ltv",
    "home equity ratio",
    "ltv mortgage calculator"
  ],
  type: "calculator",
  tags: ["mortgage", "ltv", "loan", "home value", "equity"],

  howToSteps: [
    "Enter the current appraised value or purchase price of the property.",
    "Enter the total loan amount you are borrowing or that remains on your mortgage.",
    "Click Calculate to compute your LTV ratio as a percentage.",
    "Compare your LTV against common lender thresholds for mortgage approval or refinancing."
  ],

  example: {
    description:
      "For example, if your home is worth $400,000 and your loan balance is $320,000, this calculator will show:",
    bullets: [
      "Your LTV ratio (in this case, 80%).",
      "Whether your LTV is low enough to remove PMI or qualify for better rates.",
      "How much equity you currently have in the property.",
      "How extra payments or price changes could improve your LTV over time."
    ]
  }
},

{
  slug: "mortgage-comparison",
  category: "finance",
  title: "Mortgage Comparison Calculator",
  description:
    "Compare two mortgage offers side by side by monthly payment, total interest, and total cost.",
  keywords: [
    "mortgage comparison calculator",
    "compare mortgage rates",
    "loan comparison",
    "mortgage payment comparison",
    "which mortgage is better"
  ],
  type: "calculator",
  tags: ["mortgage", "loan", "comparison", "rates", "home"],

  howToSteps: [
    "Enter the loan amount for both mortgage options (or the same amount if you’re comparing rates and terms).",
    "Enter the interest rate and term (years) for Option A.",
    "Enter the interest rate and term (years) for Option B.",
    "Click Compare to see monthly payments, total interest, and total cost for each option.",
    "Use the comparison to decide which mortgage offer is cheaper over time."
  ],

  example: {
    description:
      "For example, if Option A is a 30-year loan at 6.5% and Option B is a 15-year loan at 5.8% for the same $400,000 amount, this calculator will show:",
    bullets: [
      "The monthly payment for Option A vs Option B.",
      "Total interest paid over the life of each loan.",
      "Total cost (principal + interest) for each mortgage.",
      "Which option is cheaper long term and how much you save by choosing the better one."
    ]
  }
},

  {
    slug: "compound-interest-calculator",
    category: "finance",
    title: "Compound Interest Calculator",
    description:
      "Calculate compound interest on savings or investments based on principal, annual rate, time, and compounding frequency.",
    keywords: [
      "compound interest calculator",
      "compound interest",
      "investment calculator",
      "savings calculator",
      "future value",
    ],
    type: "calculator",
    tags: ["interest", "compound interest", "investment", "savings", "math"],
    howToSteps: [
      "Enter the starting principal amount (initial balance).",
      "Enter the annual interest rate as a percentage (for example, 5 for 5%).",
      "Enter the time period in years.",
      "Choose how often the interest is compounded (annually, monthly, daily, etc.).",
      "Click Calculate to see the future value and total interest earned.",
    ],
    example: {
      description:
        "For a $10,000 investment at 5% annual interest compounded monthly over 10 years, this calculator shows:",
      bullets: [
        "The future value of your investment after compounding.",
        "The total interest you earned over the 10-year period.",
        "How much more you earn with compounding compared to simple interest.",
      ],
    },
  },

  {
    slug: "credit-card-payoff-calculator",
    category: "finance",
    title: "Credit Card Payoff Calculator",
    description:
      "Estimate how long it will take to pay off a credit card based on balance, APR, and monthly payment.",
    keywords: [
      "credit card payoff calculator",
      "credit card calculator",
      "pay off credit card",
      "debt payoff calculator",
      "credit card interest",
    ],
    type: "calculator",
    tags: ["credit card", "debt", "payoff", "interest", "finance"],
    howToSteps: [
      "Enter your current credit card balance.",
      "Enter the annual interest rate (APR) shown on your statement.",
      "Enter the amount you can pay each month.",
      "Click Calculate to see how many months it will take to pay off your card and how much interest you will pay.",
    ],
    example: {
      description:
        "For a $5,000 credit card balance at 19.99% APR with a $200 monthly payment, this calculator shows:",
      bullets: [
        "How many months (and years) it will take to pay off the card.",
        "The total amount you will pay over time.",
        "The total interest cost of carrying the balance.",
      ],
    },
  },

  {
    slug: "debt-snowball-calculator",
    category: "finance",
    title: "Debt Snowball Calculator",
    description:
      "Use the debt snowball method to see how quickly you can pay off multiple debts using a fixed monthly budget.",
    keywords: [
      "debt snowball calculator",
      "debt payoff calculator",
      "pay off debt",
      "snowball method",
      "credit card debt",
    ],
    type: "calculator",
    tags: ["debt", "snowball", "payoff", "credit card", "loan"],
    howToSteps: [
      "Enter your total monthly budget for debt payments.",
      "List each debt with its name, current balance, APR, and minimum monthly payment.",
      "Click Calculate to simulate the debt snowball method.",
      "Review how long it will take to become debt-free and the payoff order.",
    ],
    example: {
      description:
        "For three credit cards with different balances and interest rates, this calculator shows:",
      bullets: [
        "The total time required to pay off all debts using a fixed monthly budget.",
        "The total interest paid over the payoff period.",
        "The order in which each debt will be paid off using the snowball method.",
      ],
    },
  },

    {
    slug: "biweekly-mortgage-calculator",
    category: "finance",
    title: "Biweekly Mortgage Calculator",
    description:
      "Compare a standard monthly mortgage schedule with a biweekly payment schedule and see how much interest and time you can save.",
    keywords: [
      "biweekly mortgage calculator",
      "biweekly mortgage",
      "mortgage payment",
      "mortgage payoff faster",
      "mortgage interest savings",
    ],
    type: "calculator",
    tags: ["mortgage", "biweekly", "home loan", "interest", "payoff"],
    howToSteps: [
      "Enter your mortgage loan amount.",
      "Enter the annual interest rate on the loan.",
      "Enter the loan term in years.",
      "Click Calculate to compare standard monthly payments with a biweekly schedule.",
    ],
    example: {
      description:
        "For a $300,000 mortgage at 6% over 30 years, this calculator shows:",
      bullets: [
        "The regular monthly payment amount.",
        "The biweekly payment amount.",
        "How many years and months it takes to pay off the loan with biweekly payments.",
        "How much interest you save and how many months sooner you pay off the mortgage.",
      ],
    },
  },
  
  {
    slug: "auto-loan-refinance-calculator",
    category: "finance",
    title: "Auto Loan Refinance Calculator",
    description:
      "Compare your current auto loan with a refinance offer and see how your monthly payment and total interest change.",
    keywords: [
      "auto loan refinance calculator",
      "car loan refinance calculator",
      "refinance auto loan",
      "refinance car loan",
      "auto loan calculator",
    ],
    type: "calculator",
    tags: ["auto loan", "car loan", "refinance", "interest", "payment"],
    howToSteps: [
      "Enter your remaining auto loan balance.",
      "Enter your current interest rate (APR) and remaining term in years.",
      "Enter the new refinance interest rate and new loan term.",
      "Click Compare refinance to see the difference in monthly payment and total interest.",
    ],
    example: {
      description:
        "For a $20,000 remaining balance at 8% APR with 4 years left, refinanced to 5% over 5 years, this calculator shows:",
      bullets: [
        "Your current monthly payment and total interest over the remaining term.",
        "Your new monthly payment and total interest after refinancing.",
        "The difference in interest cost so you can see whether refinancing saves money.",
      ],
    },
  },

    {
    slug: "savings-goal-calculator",
    category: "finance",
    title: "Savings Goal Calculator",
    description:
      "See how long it will take to reach a savings goal based on your current savings, monthly contributions, and expected annual growth rate.",
    keywords: [
      "savings goal calculator",
      "savings calculator",
      "time to reach savings goal",
      "investment goal calculator",
      "how long to save",
    ],
    type: "calculator",
    tags: ["savings", "goal", "investment", "interest", "planning"],
    howToSteps: [
      "Enter your current savings balance.",
      "Enter how much you plan to contribute each month.",
      "Enter your expected annual interest or growth rate.",
      "Enter your target savings goal amount.",
      "Click Calculate to see how long it will take to reach your goal.",
    ],
    example: {
      description:
        "For $5,000 in savings, contributing $300 per month at 4% annual growth toward a $20,000 goal, this calculator shows:",
      bullets: [
        "How many months and years it will take to reach $20,000.",
        "The total amount you will contribute over that time.",
        "How much of your final balance comes from interest growth.",
      ],
    },
  },

    {
    slug: "debt-avalanche-calculator",
    category: "finance",
    title: "Debt Avalanche Calculator",
    description:
      "Use the debt avalanche method to pay off debts by focusing on the highest interest rate first and minimizing total interest paid.",
    keywords: [
      "debt avalanche calculator",
      "debt payoff calculator",
      "avalanche method",
      "pay off debt",
      "credit card debt",
    ],
    type: "calculator",
    tags: ["debt", "avalanche", "payoff", "credit card", "loan"],
    howToSteps: [
      "Enter your total monthly budget for debt payments.",
      "List each debt with its name, current balance, APR, and minimum monthly payment.",
      "Click Calculate to simulate the debt avalanche method.",
      "Review the payoff time, total interest, and the order in which debts are paid off.",
    ],
    example: {
      description:
        "For multiple credit cards and loans with different rates and balances, this calculator shows:",
      bullets: [
        "How long it will take to pay off all debts using the avalanche method.",
        "The total interest you will pay over the payoff period.",
        "The order in which each debt is paid off when you always target the highest rate first.",
      ],
    },
  },



];
