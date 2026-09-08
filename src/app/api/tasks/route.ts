/**
 * GET/POST/PATCH /api/tasks
 */
import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { isUnauthorized, jsonError } from "@/lib/api-error";
import { newId, nowIso, readDb, withDb } from "@/lib/store";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  dueAt: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const tasks = readDb()
      .tasks.filter((t) => t.businessId === business.id && !t.archived)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ tasks });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("validation", 400);
    const now = nowIso();
    const task = {
      id: newId(),
      businessId: business.id,
      title: parsed.data.title,
      dueAt: parsed.data.dueAt ?? null,
      done: false,
      archived: false,
      createdAt: now,
    };
    withDb((db) => {
      db.tasks.push(task);
    });
    return NextResponse.json({ task });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const business = await requireBusiness(user.id);
    const body = (await request.json()) as { id?: string; done?: boolean };
    if (!body.id) return jsonError("validation", 400);
    const task = withDb((db) => {
      const existing = db.tasks.find(
        (t) => t.id === body.id && t.businessId === business.id && !t.archived,
      );
      if (!existing) return null;
      existing.done = Boolean(body.done);
      return existing;
    });
    if (!task) return jsonError("not_found", 404);
    return NextResponse.json({ task });
  } catch (error) {
    if (isUnauthorized(error)) return jsonError("unauthorized", 401);
    return jsonError("server", 500);
  }
}
