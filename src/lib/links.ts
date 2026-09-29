import { contacts } from "../data/site";

const GREETING = "Здравствуйте! Хочу заказать зефирные цветы.";

export function orderMessage(itemName: string): string {
  return `Здравствуйте! Хочу заказать: ${itemName}.`;
}

/** Ссылка на чат в Telegram с уже набранным сообщением. */
export function telegramUrl(message = GREETING): string {
  return `https://t.me/${contacts.telegram}?text=${encodeURIComponent(message)}`;
}

/** Ссылка на чат в WhatsApp с уже набранным сообщением. */
export function whatsappUrl(message = GREETING): string {
  return `https://wa.me/${contacts.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const telegramProfileUrl = `https://t.me/${contacts.telegram}`;

export const phoneUrl = `tel:${contacts.phone.replaceAll(/[^\d+]/g, "")}`;
