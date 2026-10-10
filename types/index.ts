/**
 * 全站共用的資料型別定義
 * 路徑：types/index.ts
 */

/** 地區篩選選項 */
export type Region = "新竹市" | "竹北市" | "竹東" | "竹南";

/** 國籍／來源篩選選項 */
export type Nationality =
  | "本島台妹"
  | "溫柔越妹"
  | "白皙泰妹"
  | "熱情菲妹";

/** 預算級距（用於篩選） */
export type BudgetLevel = "3K↓" | "3K - 4K" | "4K - 6K" | "6K以上";

/** 單一佳人／模特兒的資料結構 */
export interface Girl {
  /** 唯一識別碼 */
  id: string;
  /** 名稱 */
  name: string;
  /** 服務地區 */
  region: Region;
  /** 國籍／來源 */
  nationality: Nationality;
  /** 實際單次價格（新台幣），用於精準比對與排序 */
  price: number;
  /** 價位顯示文字，例如 "3.5K/1s" */
  priceLabel: string;
  /** 年齡 */
  age: number;
  /** 身高（cm） */
  height: number;
  /** 體重（kg） */
  weight: number;
  /** 罩杯 */
  cup: string;
  /** 預算級距，對應 Budget 篩選器 */
  priceRange: BudgetLevel;
  /** 照片網址 */
  imageUrl: string;
  /** 是否為熱門推薦（卡片會顯示徽章） */
  isHot?: boolean;
  /** 服務標籤，例如 "可外約"、"精油SPA" */
  tags?: string[];
  /** 相簿圖片（首張通常為主視覺；未提供時以 imageUrl 作為單張） */
  gallery?: string[];
  /** 服務內容勾選清單，例如 "溫柔殘廢澡"、"配合度高" */
  services?: string[];
  /** 服務時長說明，例如 "1s 90分鐘"、"2s 150分鐘" */
  duration?: string;
  /** 詳細介紹文案 */
  description?: string;
  /** 可預約時段 */
  availableTime?: string;
}

/** 地區篩選選項（「竹東/竹南」為複合選項，同時涵蓋兩個地區） */
export type RegionOption = "全部" | "新竹市" | "竹北市" | "竹東/竹南";

/** 國籍／來源篩選選項 */
export type NationalityOption = "全部" | Nationality;

/** 預算篩選選項 */
export type BudgetOption = "全部" | BudgetLevel;

/** 首頁篩選狀態 */
export interface FilterState {
  region: RegionOption;
  nationality: NationalityOption;
  budget: BudgetOption;
}
