/**
 * GET/POST/DELETE /api/crm/clients
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { archiveCustomer, createCustomer, listCustomers } from "@/services/crm";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().max(30).default(""),
  email: z.string().max(120).default(""),
  tags: z.string().max(80).default(""),
  notes: z.string().max(1000).default(""),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    return NextResponse.json({ customers: await listCustomers(business.id) });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const customer = await createCustomer(business.id, parsed.data);
    return NextResponse.json({ customer });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const { id } = (await request.json()) as { id?: string };
    if (!id) return jsonError("validation", 400);
    const row = await archiveCustomer(business.id, id);
    if (!row) return jsonError("not_found", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
