export interface RentVsBuyInputs {
  homePrice: number;
  monthlyRent: number;
  downPaymentPercent: number;
  mortgageRate: number;
  mortgageTermYears: number;
  holdingYears: number;
  propertyTaxRate: number;
  annualInsurance: number;
  monthlyHoa: number;
  maintenanceRate: number;
  monthlyPmi: number;
  buyingClosingCostRate: number;
  sellingCostRate: number;
  annualAppreciation: number;
  annualRentGrowth: number;
  annualInvestmentReturn: number;
  growOwnerCosts: boolean;
}

export interface RentVsBuyResult {
  downPayment: number;
  loanAmount: number;
  monthlyMortgage: number;
  ownerMonthlyCostYearOne: number;
  renterMonthlyCostYearOne: number;
  mortgageBalance: number;
  projectedHomeValue: number;
  netSaleProceeds: number;
  buyerPortfolio: number;
  renterPortfolio: number;
  buyerNetWorth: number;
  renterNetWorth: number;
  netWorthDifference: number;
  priceToRentRatio: number | null;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

export const defaultRentVsBuyInputs: RentVsBuyInputs = {
  homePrice: 1_000_000,
  monthlyRent: 4_000,
  downPaymentPercent: 20,
  mortgageRate: 6.25,
  mortgageTermYears: 30,
  holdingYears: 7,
  propertyTaxRate: 1.2,
  annualInsurance: 2_400,
  monthlyHoa: 0,
  maintenanceRate: 1,
  monthlyPmi: 0,
  buyingClosingCostRate: 2,
  sellingCostRate: 6,
  annualAppreciation: 3,
  annualRentGrowth: 3,
  annualInvestmentReturn: 7,
  growOwnerCosts: true,
};

function monthlyRateFromAnnual(annualPercent: number) {
  const annualRate = Math.max(-99.9, annualPercent) / 100;
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

export function calculateMortgagePayment(
  principal: number,
  annualRatePercent: number,
  termYears: number,
) {
  if (principal <= 0 || termYears <= 0) return 0;

  const numberOfPayments = termYears * 12;
  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) return principal / numberOfPayments;

  const growth = Math.pow(1 + monthlyRate, numberOfPayments);
  return (principal * monthlyRate * growth) / (growth - 1);
}

export function calculateRentVsBuy(
  inputs: RentVsBuyInputs,
  years = inputs.holdingYears,
): RentVsBuyResult {
  const homePrice = Math.max(0, inputs.homePrice);
  const downPayment =
    homePrice * Math.min(100, Math.max(0, inputs.downPaymentPercent)) / 100;
  const loanAmount = Math.max(0, homePrice - downPayment);
  const monthlyMortgage = calculateMortgagePayment(
    loanAmount,
    Math.max(0, inputs.mortgageRate),
    inputs.mortgageTermYears,
  );

  const mortgageRate = Math.max(0, inputs.mortgageRate) / 100 / 12;
  const appreciationRate = monthlyRateFromAnnual(inputs.annualAppreciation);
  const rentGrowthRate = monthlyRateFromAnnual(inputs.annualRentGrowth);
  const investmentRate = monthlyRateFromAnnual(inputs.annualInvestmentReturn);
  const buyingClosingCosts =
    homePrice * Math.max(0, inputs.buyingClosingCostRate) / 100;

  let mortgageBalance = loanAmount;
  let homeValue = homePrice;
  let monthlyRent = Math.max(0, inputs.monthlyRent);
  let renterPortfolio = downPayment + buyingClosingCosts;
  let buyerPortfolio = 0;
  let ownerMonthlyCostYearOne = 0;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;

  const months = Math.round(Math.min(40, Math.max(0, years)) * 12);
  const mortgageMonths = Math.max(0, inputs.mortgageTermYears * 12);

  for (let month = 1; month <= months; month += 1) {
    renterPortfolio *= 1 + investmentRate;
    buyerPortfolio *= 1 + investmentRate;

    let principalPaid = 0;
    let interestPaid = 0;
    let principalAndInterest = 0;

    if (mortgageBalance > 0.01 && month <= mortgageMonths) {
      interestPaid = mortgageBalance * mortgageRate;
      principalAndInterest = Math.min(
        monthlyMortgage,
        mortgageBalance + interestPaid,
      );
      principalPaid = Math.max(0, principalAndInterest - interestPaid);
      mortgageBalance = Math.max(0, mortgageBalance - principalPaid);
      totalInterestPaid += interestPaid;
      totalPrincipalPaid += principalPaid;
    }

    const homeValueFactor =
      inputs.growOwnerCosts && homePrice > 0 ? homeValue / homePrice : 1;
    const inflationFactor = inputs.growOwnerCosts
      ? Math.pow(1 + rentGrowthRate, month - 1)
      : 1;
    const propertyTax =
      homePrice * Math.max(0, inputs.propertyTaxRate) / 100 / 12 * homeValueFactor;
    const maintenance =
      homePrice * Math.max(0, inputs.maintenanceRate) / 100 / 12 * homeValueFactor;
    const insurance = Math.max(0, inputs.annualInsurance) / 12 * inflationFactor;
    const hoa = Math.max(0, inputs.monthlyHoa) * inflationFactor;
    const pmi =
      mortgageBalance > homePrice * 0.8 ? Math.max(0, inputs.monthlyPmi) : 0;

    const ownerMonthlyCost =
      principalAndInterest + propertyTax + maintenance + insurance + hoa + pmi;

    if (month === 1) ownerMonthlyCostYearOne = ownerMonthlyCost;

    const ownerPremium = ownerMonthlyCost - monthlyRent;
    if (ownerPremium > 0) renterPortfolio += ownerPremium;
    else buyerPortfolio += Math.abs(ownerPremium);

    homeValue *= 1 + appreciationRate;
    monthlyRent *= 1 + rentGrowthRate;
  }

  const sellingCosts =
    homeValue * Math.max(0, inputs.sellingCostRate) / 100;
  const netSaleProceeds = homeValue - sellingCosts - mortgageBalance;
  const buyerNetWorth = netSaleProceeds + buyerPortfolio;
  const renterNetWorth = renterPortfolio;

  return {
    downPayment,
    loanAmount,
    monthlyMortgage,
    ownerMonthlyCostYearOne,
    renterMonthlyCostYearOne: Math.max(0, inputs.monthlyRent),
    mortgageBalance,
    projectedHomeValue: homeValue,
    netSaleProceeds,
    buyerPortfolio,
    renterPortfolio,
    buyerNetWorth,
    renterNetWorth,
    netWorthDifference: buyerNetWorth - renterNetWorth,
    priceToRentRatio:
      inputs.monthlyRent > 0
        ? homePrice / (inputs.monthlyRent * 12)
        : null,
    totalInterestPaid,
    totalPrincipalPaid,
  };
}

export function findBreakEvenYear(
  inputs: RentVsBuyInputs,
  maximumYears = 40,
) {
  for (let year = 1; year <= maximumYears; year += 1) {
    if (calculateRentVsBuy(inputs, year).netWorthDifference >= 0) return year;
  }

  return null;
}
