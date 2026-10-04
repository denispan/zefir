const rubles = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** «1 500» — только число, когда знак валюты нужно оформить отдельно. */
export function formatRubles(value: number): string {
  return rubles.format(value);
}

/** «1 500 ₽» с неразрывными пробелами, чтобы цена не переносилась. */
export function formatPrice(value: number): string {
  return `${formatRubles(value)}\u00A0₽`;
}

const longDate = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Moscow",
});

/** «24 сентября 2026 г.» из YYYY-MM-DD — одинаково при сборке в любом часовом поясе. */
export function formatDate(isoDate: string): string {
  return longDate.format(new Date(`${isoDate}T12:00:00+03:00`));
}
