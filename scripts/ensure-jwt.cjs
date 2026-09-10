/**
 * Агар JWT_SECRET набошад, калиди устувор аз Vercel project — на калиди нав дар ҳар deploy.
 */
const { writeFileSync } = require("node:fs");
const { createHash, randomBytes } = require("node:crypto");
const { join } = require("node:path");

const target = join(__dirname, "..", "src", "lib", "generated-session-secret.ts");
const fromEnv = process.env.JWT_SECRET?.trim();

if (process.env.VERCEL && !fromEnv) {
  const project = process.env.VERCEL_PROJECT_ID?.trim();
  const value = project
    ? createHash("sha256").update(`bp.session.v1:${project}`).digest("hex")
    : randomBytes(32).toString("hex");
  writeFileSync(
    target,
    `export const GENERATED_SESSION_SECRET = ${JSON.stringify(value)};\n`,
    "utf8",
  );
}
