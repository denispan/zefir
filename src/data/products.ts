import type { ImageMetadata } from "astro";
import domePink from "../assets/photos/dome-pink.jpg";
import mushroomsTable from "../assets/photos/mushrooms-table.jpg";
import narrowBoxes from "../assets/photos/narrow-boxes.jpg";
import roundBoxOpen from "../assets/photos/round-box-open.jpg";
import squareBox from "../assets/photos/square-box.jpg";

export interface Product {
  id: string;
  name: string;
  size: string;
  /** Цена за штуку, ₽. */
  price: number;
  description: string;
  /** Условие заказа, если оно есть: минимальное количество и т. п. */
  condition?: string;
  photo: ImageMetadata;
  alt: string;
}

export const products: Product[] = [
  {
    id: "round-box",
    name: "Круглая коробка",
    size: "Ø 20 см",
    price: 1500,
    description:
      "Большой пышный букет — когда зефир и есть главный подарок. Тюльпаны видно через окошко в крышке.",
    photo: roundBoxOpen,
    alt: "Зефирные тюльпаны в открытой круглой коробке, рядом лента и открытка",
  },
  {
    id: "square-box",
    name: "Квадратная коробка",
    size: "20 × 20 см",
    price: 1400,
    description:
      "Тюльпаны лежат рядами, и каждый видно через прозрачную крышку. Перевязываю атласной лентой.",
    photo: squareBox,
    alt: "Бело-розовые зефирные тюльпаны в квадратной коробке с сиреневой лентой",
  },
  {
    id: "narrow-box",
    name: "Узкая коробка",
    size: "19 × 5 см",
    price: 600,
    description: "Несколько тюльпанов в ряд. Небольшой знак внимания — учителю или коллеге.",
    condition: "Заказ от 2 шт.",
    photo: narrowBoxes,
    alt: "Три узкие коробки с зефирными тюльпанами, розовыми лентами и открытками",
  },
  {
    id: "dome",
    name: "Купол",
    size: "10 см",
    price: 350,
    description:
      "Маленький букет под прозрачным куполом с бантом. Хорош как комплимент или в дополнение к подарку.",
    condition: "От 3 шт. или от 1 к другому набору",
    photo: domePink,
    alt: "Зефирные тюльпаны пастельных оттенков под прозрачным куполом с лентой",
  },
  {
    id: "mushrooms",
    name: "Грибочки в шоколаде",
    size: "15 шт. в коробке",
    price: 850,
    description: "Тот же яблочный зефир, только в виде грибов. Шляпки — в молочном шоколаде.",
    photo: mushroomsTable,
    alt: "Зефирные грибочки в шоколадной глазури в подарочной коробке с лентой",
  },
];
