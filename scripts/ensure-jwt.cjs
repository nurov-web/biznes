/**
 * Агар дар Vercel JWT_SECRET набошад, як калиди session барои ҳамин deploy месозем.
 * Калид ба git намеафтад — танҳо дар build.
 */
const { writeFileSync } = require("node:fs");
const { randomBytes } = require("node:crypto");
const { join } = require("node:path");

const target = join(__dirname, "..", "src", "lib", "generated-session-secret.ts");
const fromEnv = process.env.JWT_SECRET?.trim();

if (process.env.VERCEL && !fromEnv) {
  const value = randomBytes(32).toString("hex");
  writeFileSync(
    target,
    `export const GENERATED_SESSION_SECRET = ${JSON.stringify(value)};\n`,
    "utf8",
  );
}
