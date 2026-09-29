// Контакты, анонс и условия заказа. Цены и наборы — в products.ts.

export interface Announcement {
  text: string;
  /** Последний день показа (YYYY-MM-DD). После него анонс не попадёт в следующую сборку. */
  until: string;
}

export const business = {
  name: "Татьяна",
  tagline: "зефирные цветы ручной работы",
  city: "Москва",
  metro: "м. Аэропорт",
  pickupAddress: "ул. Академика Ильюшина",
} as const;

export const contacts = {
  phone: "+7 965 434-84-48",
  telegram: "Tatyana_Gromova_msk",
  whatsapp: "79654348448",
  // Ссылку на профиль в MAX можно взять в приложении: Настройки → QR-код → «Поделиться».
  // Пока её нет, MAX показывается номером телефона.
  maxProfileUrl: "",
  // Профиль на Авито: если заполнить, под отзывами появится кнопка «Все отзывы на Авито».
  avitoProfileUrl: "",
} as const;

export const announcement: Announcement | null = {
  text: "Принимаю заказы ко Дню учителя — 5 октября",
  until: "2026-10-05",
};

export const terms = {
  leadTime: "2–3 дня",
  prepayment: "50%",
  freeDeliveryFrom: 3500,
  deliveryInsideMkad: 1000,
  bulkBoxes: 10,
  bulkDiscount: "10%",
  shelfLife: "7–10 суток",
} as const;
