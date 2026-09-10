import { PrismaClient } from "@prisma/client";

/**
 * Месанҷад, ки оё DATABASE_URL дорои суроғаи PostgreSQL мебошад.
 */
export function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const g = globalThis as GlobalWithPrisma;

/**
 * Singleton-клиенти Prisma.
 * Танҳо вақте сохта мешавад, ки DATABASE_URL ба postgresql:// ё postgres:// оғоз ёбад.
 */
export const prisma: PrismaClient | null = isPostgresConfigured()
  ? (g.prisma ??= new PrismaClient())
  : null;
