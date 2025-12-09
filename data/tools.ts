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

];
