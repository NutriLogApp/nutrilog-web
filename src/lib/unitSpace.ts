/**
 * Returns a space between number and unit in Hebrew (units are full words),
 * no space in English (units are compact symbols like g, L, mL).
 */
export function us(): string {
  return document.documentElement.dir === "rtl" ? " " : "";
}
