/**
 * 模擬資料庫（正式環境請替換為 API / CMS 資料來源）
 * 路徑：data/mockData.ts
 */

import type {
  BudgetOption,
  BudgetLevel,
  Girl,
  Nationality,
  NationalityOption,
  Region,
  RegionOption,
} from "@/types";

/** 佳人／模特兒模擬資料 */
export const girlsData: Girl[] = [
  {
    id: "g-001",
    name: "閃亮亮",
    region: "竹北市",
    nationality: "本島台妹",
    price: 3500,
    priceLabel: "3.5K/1s",
    age: 23,
    height: 163,
    weight: 48,
    cup: "D",
    priceRange: "3K - 4K",
    imageUrl: "/girls/girl-1.svg",
    isHot: true,
    tags: ["氣質甜美", "可外約", "精油SPA"],
    gallery: [
      "/girls/girl-1.svg",
      "/girls/girl-2.svg",
      "/girls/girl-3.svg",
      "/girls/girl-5.svg",
    ],
    services: ["溫柔殘廢澡", "絲足誘惑", "配合度高", "溫柔聽話"],
    duration: "1s 約 90 分鐘",
    availableTime: "14:00 - 02:00",
    description:
      "氣質甜美的本島台妹，談吐溫柔有禮，擅長精油舒壓與全身放鬆。肌膚保養得宜，手感細緻，很懂得照顧對方情緒，適合想要被溫柔對待的您。",
  },
  {
    id: "g-002",
    name: "白皙糖糖",
    region: "新竹市",
    nationality: "白皙泰妹",
    price: 2800,
    priceLabel: "2.8K/1s",
    age: 21,
    height: 158,
    weight: 45,
    cup: "C",
    priceRange: "3K↓",
    imageUrl: "/girls/girl-2.svg",
    tags: ["皮膚白皙", "美甲造型"],
    gallery: [
      "/girls/girl-2.svg",
      "/girls/girl-6.svg",
      "/girls/girl-4.svg",
    ],
    services: ["美白護膚", "美甲造型", "配合度高", "氣質交談"],
    duration: "1s 約 90 分鐘",
    availableTime: "15:00 - 01:00",
    description:
      "來自泰國的白皙妹子，膚色雪白細緻，妝容精緻。擅長美甲造型與美白護膚保養，個性內斂害羞但相當配合，喜歡白皙系的您千萬不能錯過。",
  },
  {
    id: "g-003",
    name: "溫柔阿珠",
    region: "竹東",
    nationality: "溫柔越妹",
    price: 5200,
    priceLabel: "5.2K/2s",
    age: 25,
    height: 167,
    weight: 51,
    cup: "E",
    priceRange: "4K - 6K",
    imageUrl: "/girls/girl-3.svg",
    isHot: true,
    tags: ["溫柔體貼", "全身按摩"],
    gallery: [
      "/girls/girl-3.svg",
      "/girls/girl-5.svg",
      "/girls/girl-1.svg",
      "/girls/girl-6.svg",
    ],
    services: ["溫柔殘廢澡", "全身油壓", "絲足誘惑", "配合度高", "溫柔聽話"],
    duration: "2s 約 150 分鐘",
    availableTime: "13:00 - 03:00",
    description:
      "溫柔體貼的越籍佳人，按摩手法專業，擅長全身油壓與經絡舒緩。講話輕聲細語，非常聽話配合，是放鬆身心的首選，回訪率極高。",
  },
  {
    id: "g-004",
    name: "熱情莎莎",
    region: "竹南",
    nationality: "熱情菲妹",
    price: 6800,
    priceLabel: "6.8K/2s",
    age: 24,
    height: 170,
    weight: 54,
    cup: "F",
    priceRange: "6K以上",
    imageUrl: "/girls/girl-4.svg",
    tags: ["熱情活潑", "可過夜"],
    gallery: [
      "/girls/girl-4.svg",
      "/girls/girl-2.svg",
      "/girls/girl-6.svg",
      "/girls/girl-3.svg",
    ],
    services: ["熱情互動", "可過夜", "角色扮演", "配合度高", "伴遊外出"],
    duration: "2s 約 150 分鐘",
    availableTime: "20:00 - 06:00",
    description:
      "熱情活潑的菲籍妹子，身高 170 身材高挑，個性開朗外向。互動積極主動，可配合角色扮演，也接受伴遊外出與過夜，適合喜歡熱鬧氛圍的您。",
  },
  {
    id: "g-005",
    name: "鄰家小雨",
    region: "新竹市",
    nationality: "本島台妹",
    price: 4600,
    priceLabel: "4.6K/1s",
    age: 22,
    height: 160,
    weight: 46,
    cup: "C",
    priceRange: "4K - 6K",
    imageUrl: "/girls/girl-5.svg",
    tags: ["鄰家女孩", "美甲精油"],
    gallery: [
      "/girls/girl-5.svg",
      "/girls/girl-1.svg",
      "/girls/girl-2.svg",
    ],
    services: ["溫柔殘廢澡", "精油SPA", "美甲保養", "氣質交談"],
    duration: "1s 約 90 分鐘",
    availableTime: "14:00 - 24:00",
    description:
      "氣質出眾的鄰家女孩類型，斯文有禮不張揚。精油芳療手法細膩，美甲保養也有基礎，相處起來像女朋友般自然舒服，適合喜歡清淡長久型的您。",
  },
  {
    id: "g-006",
    name: "泰奶娜娜",
    region: "竹北市",
    nationality: "白皙泰妹",
    price: 3200,
    priceLabel: "3.2K/1s",
    age: 20,
    height: 155,
    weight: 43,
    cup: "B",
    priceRange: "3K - 4K",
    imageUrl: "/girls/girl-6.svg",
    tags: ["青春可愛", "精油SPA"],
    gallery: [
      "/girls/girl-6.svg",
      "/girls/girl-2.svg",
      "/girls/girl-5.svg",
    ],
    services: ["可愛互動", "精油SPA", "絲足誘惑", "配合度高"],
    duration: "1s 約 90 分鐘",
    availableTime: "15:00 - 01:00",
    description:
      "年紀最輕的可愛系泰籍妹子，身材嬌小玲瓏，笑起來非常甜。個性黏人愛撒嬌，配合度極高，喜歡青春可愛類型的您一定會喜歡。",
  },
];

/**
 * 依 id 查詢單一佳人資料
 * @param id 網址傳入的 id
 * @returns 找到則回傳資料，找不到則回傳 undefined
 */
export function getGirlById(id: string): Girl | undefined {
  return girlsData.find((girl) => girl.id === id);
}

/** 頂部公告跑馬燈內容 */
export const announcementText =
  "⚠️ 官方公告：近期詐騙頻繁，唯一指定 LINE 客服請認明官方綠色盾牌，其餘皆為詐騙！";

/** 官方 LINE 預約連結（請替換為實際帳號） */
export const LINE_URL = "https://line.me/R/ti/p/@your-official-id";

/** Telegram 交流群連結（請替換為實際群組） */
export const TELEGRAM_URL = "https://t.me/your-group";

/** 篩選器選項定義 */
export const filterOptions = {
  region: [
    "全部",
    "新竹市",
    "竹北市",
    "竹東/竹南",
  ] satisfies RegionOption[],
  nationality: [
    "全部",
    "本島台妹",
    "溫柔越妹",
    "白皙泰妹",
    "熱情菲妹",
  ] satisfies NationalityOption[],
  budget: [
    "全部",
    "3K↓",
    "3K - 4K",
    "4K - 6K",
    "6K以上",
  ] satisfies BudgetOption[],
};

/** 篩選器顯示標題 */
export const filterLabels: Record<"region" | "nationality" | "budget", string> =
  {
    region: "地區",
    nationality: "國籍",
    budget: "預算",
  };

/** 型別再匯出，方便只從 data 層取用 */
export type { BudgetLevel, Girl, Nationality, Region };
