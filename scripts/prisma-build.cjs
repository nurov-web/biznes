/**
 * prisma generate ҳамеша (барои build).
 * migrate deploy танҳо агар DATABASE_URL-и воқеии PostgreSQL бошад.
 */
const { spawnSync } = require("node:child_process");

const DUMMY = "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

function isPostgres(url) {
  const value = (url || "").trim();
  return value.startsWith("postgres://") || value.startsWith("postgresql://");
}

const original = (process.env.DATABASE_URL || "").trim();
if (!original) {
  process.env.DATABASE_URL = DUMMY;
}

function run(args) {
  const result = spawnSync("npx", args, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status) process.exit(result.status ?? 1);
}

run(["prisma", "generate"]);

if (isPostgres(original)) {
  run(["prisma", "migrate", "deploy"]);
}
