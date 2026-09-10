/**
 * Next.js instrumentation.
 * Барои омодасозии маълумот аз PostgreSQL ҳангоми старти сервер.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { readDb } = await import("@/lib/store");
    await readDb();
  }
}
