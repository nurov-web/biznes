import type { BusinessType, Channel, DealStage, Role } from "@/constants";

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  phoneVerified: boolean;
};

export type SessionPayload = {
  sub: string;
  role: Role;
};

export type OnboardingPayload = {
  name: string;
  type: BusinessType;
  typeNote: string;
  city: string;
  region: string;
  yearsOpen: number;
  employees: number;
  channel: Channel;
  competitors: string;
  audience: string;
  products: ProductDraft[];
};

export type ProductDraft = {
  category: string;
  brand: string;
  model: string;
  buyPriceMin: number;
  buyPriceMax: number;
  sellPriceMin: number;
  sellPriceMax: number;
  quantity: number;
  condition: "new" | "used";
};

export type AdviceCard = {
  level: "green" | "yellow" | "red";
  title: string;
  detail: string;
  action: string;
};

export type AiAnalysisPayload = {
  priceAdvice: AdviceCard[];
  inventoryAdvice: AdviceCard[];
  growthAdvice: AdviceCard[];
  risks: AdviceCard[];
  dailyTip: string;
  summary: string;
};

export type DashboardStats = {
  todaySales: number;
  profit: number;
  newClients: number;
  lowStock: number;
};

export type ApiErrorBody = {
  error: string;
  fields?: Record<string, string>;
};

export type DealDto = {
  id: string;
  title: string;
  stage: DealStage;
  amount: number;
  customerId: string | null;
  lostReason: string;
};
