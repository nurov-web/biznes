import { readDb } from "@/lib/store";

export async function getOwnedBusiness(userId: string) {
  const rows = (await readDb()).businesses.filter((b) => b.ownerId === userId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export async function requireBusiness(userId: string) {
  const business = await getOwnedBusiness(userId);
  if (!business) {
    throw new Error("NO_BUSINESS");
  }
  return business;
}
