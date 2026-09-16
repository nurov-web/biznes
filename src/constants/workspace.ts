import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LineChart,
  MessageCircle,
  Package,
  Plug,
  Rocket,
  ShoppingBag,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import type { PilotCategory } from "@/constants/pilot";

export type WorkspaceHref =
  | "/dashboard"
  | "/business"
  | "/diagnosis"
  | "/strategy"
  | "/architecture"
  | "/plan"
  | "/pos"
  | "/crm"
  | "/inventory"
  | "/finance"
  | "/analytics"
  | "/learn"
  | "/agents"
  | "/integrations"
  | "/tasks";

export type WorkspaceNavItem = {
  href: WorkspaceHref;
  key: string;
  icon: LucideIcon;
};

/** Менюи содда: Имрӯз, пул, мизоҷ, мол, нақша, ИИ. */
export const SIMPLE_RAIL: WorkspaceNavItem[] = [
  { href: "/dashboard", key: "today", icon: LayoutDashboard },
  { href: "/finance", key: "money", icon: Wallet },
  { href: "/crm", key: "customers", icon: Users },
  { href: "/inventory", key: "products", icon: Package },
  { href: "/plan", key: "plan", icon: Rocket },
  { href: "/agents", key: "ai", icon: MessageCircle },
];

/** Менюи Pro — сохтори маҳсул, на девори 20 саҳифа. */
export const PRO_RAIL: { group: string; items: WorkspaceNavItem[] }[] = [
  {
    group: "now",
    items: [
      { href: "/dashboard", key: "today", icon: LayoutDashboard },
      { href: "/tasks", key: "tasks", icon: ClipboardCheck },
    ],
  },
  {
    group: "think",
    items: [
      { href: "/business", key: "business", icon: Building2 },
      { href: "/diagnosis", key: "diagnosis", icon: Stethoscope },
      { href: "/strategy", key: "strategy", icon: Compass },
      { href: "/architecture", key: "architecture", icon: Layers },
      { href: "/plan", key: "plan", icon: Rocket },
    ],
  },
  {
    group: "run",
    items: [
      { href: "/pos", key: "sales", icon: ShoppingBag },
      { href: "/crm", key: "customers", icon: Users },
      { href: "/inventory", key: "products", icon: Package },
      { href: "/finance", key: "money", icon: Wallet },
    ],
  },
  {
    group: "see",
    items: [
      { href: "/analytics", key: "analytics", icon: LineChart },
      { href: "/learn", key: "learn", icon: GraduationCap },
      { href: "/agents", key: "ai", icon: MessageCircle },
      { href: "/integrations", key: "integrations", icon: Plug },
    ],
  },
];

/** Мобил: Имрӯз · ИИ · Вазифа · Фурӯш · Пул */
export const MOBILE_TABS: WorkspaceNavItem[] = [
  { href: "/dashboard", key: "today", icon: LayoutDashboard },
  { href: "/agents", key: "ai", icon: MessageCircle },
  { href: "/tasks", key: "tasks", icon: ClipboardCheck },
  { href: "/pos", key: "sales", icon: ShoppingBag },
  { href: "/finance", key: "money", icon: Wallet },
];

export type ModulePack = {
  titleKey: string;
  nodes: { key: string; href: WorkspaceHref }[];
};

/** Модул аз навъи бизнес — бе дӯкони сохта. */
export function modulePackFor(category: string): ModulePack {
  const cat = category as PilotCategory;
  if (cat === "food") {
    return {
      titleKey: "packFood",
      nodes: [
        { key: "sales", href: "/pos" },
        { key: "products", href: "/inventory" },
        { key: "money", href: "/finance" },
        { key: "tasks", href: "/tasks" },
      ],
    };
  }
  if (cat === "beauty") {
    return {
      titleKey: "packBeauty",
      nodes: [
        { key: "customers", href: "/crm" },
        { key: "tasks", href: "/tasks" },
        { key: "money", href: "/finance" },
        { key: "sales", href: "/pos" },
      ],
    };
  }
  if (cat === "construction") {
    return {
      titleKey: "packBuild",
      nodes: [
        { key: "plan", href: "/plan" },
        { key: "tasks", href: "/tasks" },
        { key: "money", href: "/finance" },
        { key: "products", href: "/inventory" },
      ],
    };
  }
  if (cat === "services" || cat === "transport") {
    return {
      titleKey: "packService",
      nodes: [
        { key: "customers", href: "/crm" },
        { key: "tasks", href: "/tasks" },
        { key: "sales", href: "/pos" },
        { key: "money", href: "/finance" },
      ],
    };
  }
  if (cat === "trade" || cat === "production") {
    return {
      titleKey: "packShop",
      nodes: [
        { key: "products", href: "/inventory" },
        { key: "sales", href: "/pos" },
        { key: "customers", href: "/crm" },
        { key: "money", href: "/finance" },
      ],
    };
  }
  return {
    titleKey: "packFarm",
    nodes: [
      { key: "products", href: "/inventory" },
      { key: "sales", href: "/pos" },
      { key: "customers", href: "/crm" },
      { key: "money", href: "/finance" },
    ],
  };
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/crm") return pathname === "/crm" || pathname.startsWith("/crm/");
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
