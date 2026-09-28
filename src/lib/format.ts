const rubles = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** «1 500 ₽» с неразрывными пробелами, чтобы цена не переносилась. */
export function formatPrice(value: number): string {
  return `${rubles.format(value)} ₽`;
}
