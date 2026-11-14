const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const withCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 2300 -> "$2,300", 12.5 -> "$12.50", 0 -> "Free" */
export function formatPrice(value: number | string | null | undefined): string {
  const price = Number(value);
  if (!Number.isFinite(price)) return "";
  if (price === 0) return "Free";
  return Number.isInteger(price) ? wholeDollars.format(price) : withCents.format(price);
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "just now", "5 minutes ago", "yesterday", "3 weeks ago" */
export function formatRelativeTime(date: string | Date, now: Date = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.round((then.getTime() - now.getTime()) / 1000);
  if (Math.abs(seconds) < 60) return "just now";
  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return "just now";
}
