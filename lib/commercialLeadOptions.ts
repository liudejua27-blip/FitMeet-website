export const investorInterestOptions = [
  "Investing",
  "Strategic partnership",
  "Brand campaign",
  "City / campus pilot",
  "Sports / travel ecosystem",
  "Press / advisor",
] as const;

export const partnerInterestOptions = [
  "Brand campaign",
  "City pilot",
  "Campus program",
  "Sports ecosystem",
  "Travel partnership",
  "Local business",
] as const;

export type InvestorInterest = (typeof investorInterestOptions)[number];
export type PartnerInterest = (typeof partnerInterestOptions)[number];

export function isInvestorInterest(value: string | undefined): value is InvestorInterest {
  return Boolean(value && (investorInterestOptions as readonly string[]).includes(value));
}

export function isPartnerInterest(value: string | undefined): value is PartnerInterest {
  return Boolean(value && (partnerInterestOptions as readonly string[]).includes(value));
}
