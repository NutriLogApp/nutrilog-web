/**
 * Returns today's date as YYYY-MM-DD in the user's LOCAL timezone.
 * toISOString() would return UTC which is wrong near midnight.
 */
export function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
