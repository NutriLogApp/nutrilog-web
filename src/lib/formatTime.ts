/**
 * Format time in a way that doesn't break in RTL.
 * Returns plain string without AM/PM markers that cause RTL reordering.
 */
export function formatTime(dateStr: string, use24h: boolean): string {
  const d = new Date(dateStr);
  if (use24h) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  // For 12h format, build manually to avoid RTL issues
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}
