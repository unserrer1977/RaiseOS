import { CUSTOMER_TYPES, STAGES, type PillarId } from "@/lib/types";

export interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  kind?: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

export interface PillarDef {
  id: PillarId;
  kicker: string;
  title: string;
  /** Title shown in the angel flow, where the reader is assessing someone else's company. */
  angelTitle?: string;
  fields: FieldDef[];
}

export const PILLARS: PillarDef[] = [
  {
    id: "company",
    kicker: "Company",
    title: "Who is building this?",
    fields: [
      { key: "legalName", label: "Legal name", placeholder: "Northstar Labs Ltd" },
      { key: "country", label: "Country", placeholder: "United Kingdom" },
      { key: "teamSize", label: "Team size", placeholder: "6" },
      {
        key: "founderBackgrounds",
        label: "Founder backgrounds",
        placeholder: "Domain expertise, prior companies",
        kind: "textarea",
      },
    ],
  },
  {
    id: "problem",
    kicker: "Problem and solution",
    title: "What hurts, and what do you sell?",
    angelTitle: "What hurts, and what do they sell?",
    fields: [
      { key: "pain", label: "Pain", placeholder: "The specific cost of the status quo", kind: "textarea" },
      { key: "customerProfile", label: "Target customer", placeholder: "Who pays" },
      { key: "valueProposition", label: "Value proposition", placeholder: "Why they switch", kind: "textarea" },
      { key: "solution", label: "Solution", placeholder: "What the product actually is", kind: "textarea" },
      { key: "tam", label: "TAM", placeholder: "£1.2B" },
      { key: "sam", label: "SAM", placeholder: "£400M" },
      { key: "som", label: "SOM", placeholder: "£40M" },
    ],
  },
  {
    id: "gtm",
    kicker: "Go-to-market",
    title: "How does a dollar get in?",
    angelTitle: "How will they win customers?",
    fields: [
      {
        key: "customerType",
        label: "Customer type",
        placeholder: "",
        kind: "select",
        options: [{ value: "", label: "Select" }, ...CUSTOMER_TYPES],
      },
      { key: "priceOrAcv", label: "Price or ACV", placeholder: "£50/month or £24k ACV" },
      { key: "cac", label: "CAC", placeholder: "£4,000" },
      { key: "ltv", label: "LTV", placeholder: "£18,000" },
      { key: "channels", label: "Distribution channels", placeholder: "Outbound, PLG, partners" },
      { key: "salesCycle", label: "Sales cycle", placeholder: "90 days" },
    ],
  },
  {
    id: "traction",
    kicker: "Traction",
    title: "What is already true?",
    angelTitle: "What have they proven so far?",
    fields: [
      { key: "mrrOrGmv", label: "MRR or GMV", placeholder: "£12,000 MRR" },
      { key: "momGrowth", label: "MoM growth", placeholder: "18%" },
      { key: "activeUsers", label: "Active users", placeholder: "40" },
      { key: "churn", label: "Churn", placeholder: "2%" },
    ],
  },
  {
    id: "capTable",
    kicker: "Cap table",
    title: "Who owns the company?",
    angelTitle: "Who owns it, and on what terms?",
    fields: [
      { key: "amountRaised", label: "Total raised", placeholder: "£1.5M" },
      {
        key: "stage",
        label: "Stage",
        placeholder: "",
        kind: "select",
        options: [{ value: "", label: "Select" }, ...STAGES],
      },
      { key: "valuationOrCap", label: "Valuation or cap", placeholder: "£12M cap" },
      { key: "founderEquityPercent", label: "Founder equity", placeholder: "70%" },
      { key: "notableInvestors", label: "Existing investors", placeholder: "Names, or none yet" },
    ],
  },
];
