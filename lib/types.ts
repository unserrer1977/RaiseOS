export const CUSTOMER_TYPES = [
  { value: "b2b_enterprise", label: "Enterprise B2B" },
  { value: "b2b_smb", label: "SMB / mid-market" },
  { value: "consumer", label: "Consumer" },
  { value: "other", label: "Other" },
] as const;

export const STAGES = [
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "other", label: "Other" },
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number]["value"] | "";
export type Stage = (typeof STAGES)[number]["value"] | "";
export type FieldSource = "deck" | "founder";
export type AssessmentStatus = "intake" | "followup" | "complete";
export type ExtractionMode = "rules" | "model";
export type NarrativeSource = "rules" | "model";

export interface Intake {
  company: {
    legalName: string;
    foundingDate: string;
    headquarters: string;
    teamSize: string;
    founderBackgrounds: string;
  };
  problem: {
    pain: string;
    customerProfile: string;
    valueProposition: string;
    solution: string;
    tam: string;
    sam: string;
    som: string;
  };
  gtm: {
    cac: string;
    ltv: string;
    channels: string;
    salesCycle: string;
    priceOrAcv: string;
    customerType: CustomerType;
  };
  traction: {
    mrrOrGmv: string;
    momGrowth: string;
    activeUsers: string;
    churn: string;
  };
  capTable: {
    amountRaised: string;
    stage: Stage;
    valuationOrCap: string;
    founderEquityPercent: string;
    notableInvestors: string;
  };
}

export type PillarId = "company" | "problem" | "gtm" | "traction" | "capTable";

export interface FollowUp {
  id: "market_scale" | "gtm_plg" | "cap_table" | "unit_economics" | "traction_evidence";
  pillar: PillarId;
  question: string;
  reason: string;
  answer: string;
}

export type Verdict = "highly_fundable" | "borderline" | "bootstrap";

export interface Report {
  verdict: Verdict;
  verdictLabel: string;
  companyName: string;
  rationale: string;
  ventureScale: string;
  greenFlags: string[];
  redFlags: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  narrativeSource: NarrativeSource;
}

export interface AssessmentRecord {
  id: string;
  user_id: string;
  status: AssessmentStatus;
  intake: Intake;
  field_sources: Record<string, FieldSource>;
  follow_ups: FollowUp[];
  report: Report | null;
  share_token: string;
  deck_path: string | null;
  deck_name: string | null;
  deck_text: string | null;
  extraction_mode: ExtractionMode;
  extraction_note: string | null;
  created_at: string;
  updated_at: string;
}

export function emptyIntake(): Intake {
  return {
    company: {
      legalName: "",
      foundingDate: "",
      headquarters: "",
      teamSize: "",
      founderBackgrounds: "",
    },
    problem: {
      pain: "",
      customerProfile: "",
      valueProposition: "",
      solution: "",
      tam: "",
      sam: "",
      som: "",
    },
    gtm: {
      cac: "",
      ltv: "",
      channels: "",
      salesCycle: "",
      priceOrAcv: "",
      customerType: "",
    },
    traction: {
      mrrOrGmv: "",
      momGrowth: "",
      activeUsers: "",
      churn: "",
    },
    capTable: {
      amountRaised: "",
      stage: "",
      valuationOrCap: "",
      founderEquityPercent: "",
      notableInvestors: "",
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function coerceIntake(value: unknown): Intake {
  const intake = emptyIntake();
  if (!isRecord(value)) return intake;

  const company = isRecord(value.company) ? value.company : {};
  const problem = isRecord(value.problem) ? value.problem : {};
  const gtm = isRecord(value.gtm) ? value.gtm : {};
  const traction = isRecord(value.traction) ? value.traction : {};
  const capTable = isRecord(value.capTable) ? value.capTable : {};

  intake.company = {
    legalName: str(company.legalName),
    foundingDate: str(company.foundingDate),
    headquarters: str(company.headquarters),
    teamSize: str(company.teamSize),
    founderBackgrounds: str(company.founderBackgrounds),
  };
  intake.problem = {
    pain: str(problem.pain),
    customerProfile: str(problem.customerProfile),
    valueProposition: str(problem.valueProposition),
    solution: str(problem.solution),
    tam: str(problem.tam),
    sam: str(problem.sam),
    som: str(problem.som),
  };

  const customerType = str(gtm.customerType);
  intake.gtm = {
    cac: str(gtm.cac),
    ltv: str(gtm.ltv),
    channels: str(gtm.channels),
    salesCycle: str(gtm.salesCycle),
    priceOrAcv: str(gtm.priceOrAcv),
    customerType: CUSTOMER_TYPES.some((item) => item.value === customerType)
      ? (customerType as CustomerType)
      : "",
  };

  intake.traction = {
    mrrOrGmv: str(traction.mrrOrGmv),
    momGrowth: str(traction.momGrowth),
    activeUsers: str(traction.activeUsers),
    churn: str(traction.churn),
  };

  const stage = str(capTable.stage);
  intake.capTable = {
    amountRaised: str(capTable.amountRaised),
    stage: STAGES.some((item) => item.value === stage) ? (stage as Stage) : "",
    valuationOrCap: str(capTable.valuationOrCap),
    founderEquityPercent: str(capTable.founderEquityPercent),
    notableInvestors: str(capTable.notableInvestors),
  };

  return intake;
}

export function fieldPath(pillar: PillarId, key: string): string {
  return `${pillar}.${key}`;
}
