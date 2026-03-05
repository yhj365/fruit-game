export type FruitSymbol =
  | "apple"
  | "watermelon"
  | "papaya"
  | "orange"
  | "bell"
  | "sevens"
  | "double_star"
  | "bar";

export type TileType = "symbol" | "good_luck";

export type FruitTile = {
  index: number;
  type: TileType;
  symbol?: FruitSymbol;
  multiplier?: number;
};

// 24 格跑灯布局，按顺时针从左上角开始。
// 可根据实际美术需求在前端做对应排布。
export const tiles: FruitTile[] = [
  { index: 0, type: "symbol", symbol: "orange", multiplier: 2 },
  { index: 1, type: "symbol", symbol: "bell", multiplier: 3 },
  { index: 2, type: "symbol", symbol: "bar", multiplier: 50 },
  { index: 3, type: "symbol", symbol: "bar", multiplier: 25 },
  { index: 4, type: "symbol", symbol: "apple", multiplier: 2 },
  { index: 5, type: "symbol", symbol: "watermelon", multiplier: 3 },
  { index: 6, type: "symbol", symbol: "orange", multiplier: 2 },
  { index: 7, type: "symbol", symbol: "apple", multiplier: 2 },
  { index: 8, type: "symbol", symbol: "orange", multiplier: 2 },
  { index: 9, type: "symbol", symbol: "bell", multiplier: 3 },
  { index: 10, type: "symbol", symbol: "apple", multiplier: 2 },
  { index: 11, type: "symbol", symbol: "watermelon", multiplier: 3 },
  { index: 12, type: "good_luck" },
  { index: 13, type: "symbol", symbol: "double_star", multiplier: 10 },
  { index: 14, type: "symbol", symbol: "sevens", multiplier: 20 },
  { index: 15, type: "symbol", symbol: "bell", multiplier: 3 },
  { index: 16, type: "symbol", symbol: "apple", multiplier: 2 },
  { index: 17, type: "symbol", symbol: "orange", multiplier: 2 },
  { index: 18, type: "symbol", symbol: "watermelon", multiplier: 3 },
  { index: 19, type: "symbol", symbol: "papaya", multiplier: 3 },
  { index: 20, type: "symbol", symbol: "apple", multiplier: 2 },
  { index: 21, type: "symbol", symbol: "watermelon", multiplier: 3 },
  { index: 22, type: "symbol", symbol: "papaya", multiplier: 3 },
  { index: 23, type: "symbol", symbol: "bell", multiplier: 3 }
];

export const bettableSymbols: FruitSymbol[] = [
  "apple",
  "watermelon",
  "papaya",
  "orange",
  "bell",
  "sevens",
  "double_star",
  "bar"
];

export const symbolDisplayName: Record<FruitSymbol, string> = {
  apple: "苹果",
  watermelon: "西瓜",
  papaya: "木瓜",
  orange: "橙子",
  bell: "铃铛",
  sevens: "77",
  double_star: "双星",
  bar: "BAR"
};

