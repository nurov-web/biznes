/**
 * GET /api/health — зинда будани хизмат. Бе ифшои конфиг.
 */
import { NextResponse } from "next/server";
import { readDb } from "@/lib/store";

export async function GET() {
  try {
    await readDb();
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, time: new Date().toISOString() }, { status: 503 });
  }
}
