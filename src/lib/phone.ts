/** Рақамро ба шакли +рақамҳо меорад, то муқоиса якхела бошад. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  return `+${digits}`;
}
