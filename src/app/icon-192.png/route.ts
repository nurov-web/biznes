import { appIconPng } from "@/lib/app-icon";

export const runtime = "nodejs";

export function GET() {
  return appIconPng(192);
}
