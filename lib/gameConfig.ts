export type FruitSymbol =
  | "apple"
  | "watermelon"
  | "papaya"
  | "orange"
  | "bell"
  | "sevens"
  | "double_star"
  | "bar";

export type FruitTile = {
  index: number;
  row: number;
  column: number;
  cropX: number;
  cropY: number;
  type: "symbol" | "good_luck";
  symbol?: FruitSymbol;
  multiplier?: number;
};

// The 7×7 outer ring contains 24 cells. Index 0 is upper left, clockwise.
export const tiles: FruitTile[] = [
  { index: 0, row: 0, column: 0, cropX: 84, cropY: 28, type: "symbol", symbol: "orange", multiplier: 10 },
  { index: 1, row: 0, column: 1, cropX: 154, cropY: 28, type: "symbol", symbol: "bell", multiplier: 10 },
  { index: 2, row: 0, column: 2, cropX: 224, cropY: 28, type: "symbol", symbol: "bar", multiplier: 25 },
  { index: 3, row: 0, column: 3, cropX: 294, cropY: 28, type: "symbol", symbol: "bar", multiplier: 50 },
  { index: 4, row: 0, column: 4, cropX: 364, cropY: 28, type: "symbol", symbol: "apple", multiplier: 5 },
  { index: 5, row: 0, column: 5, cropX: 434, cropY: 28, type: "symbol", symbol: "apple", multiplier: 2 },
  { index: 6, row: 0, column: 6, cropX: 504, cropY: 28, type: "symbol", symbol: "papaya", multiplier: 10 },
  { index: 7, row: 1, column: 6, cropX: 504, cropY: 98, type: "symbol", symbol: "watermelon", multiplier: 20 },
  { index: 8, row: 2, column: 6, cropX: 504, cropY: 168, type: "symbol", symbol: "watermelon", multiplier: 2 },
  { index: 9, row: 3, column: 6, cropX: 504, cropY: 238, type: "good_luck" },
  { index: 10, row: 4, column: 6, cropX: 504, cropY: 308, type: "symbol", symbol: "apple", multiplier: 5 },
  { index: 11, row: 5, column: 6, cropX: 504, cropY: 378, type: "symbol", symbol: "orange", multiplier: 2 },
  { index: 12, row: 6, column: 6, cropX: 504, cropY: 448, type: "symbol", symbol: "orange", multiplier: 10 },
  { index: 13, row: 6, column: 5, cropX: 434, cropY: 448, type: "symbol", symbol: "bell", multiplier: 10 },
  { index: 14, row: 6, column: 4, cropX: 364, cropY: 448, type: "symbol", symbol: "sevens", multiplier: 2 },
  { index: 15, row: 6, column: 3, cropX: 294, cropY: 448, type: "symbol", symbol: "sevens", multiplier: 20 },
  { index: 16, row: 6, column: 2, cropX: 224, cropY: 448, type: "symbol", symbol: "apple", multiplier: 5 },
  { index: 17, row: 6, column: 1, cropX: 154, cropY: 448, type: "symbol", symbol: "papaya", multiplier: 2 },
  { index: 18, row: 6, column: 0, cropX: 84, cropY: 448, type: "symbol", symbol: "papaya", multiplier: 10 },
  { index: 19, row: 5, column: 0, cropX: 84, cropY: 378, type: "symbol", symbol: "double_star", multiplier: 20 },
  { index: 20, row: 4, column: 0, cropX: 84, cropY: 308, type: "symbol", symbol: "double_star", multiplier: 2 },
  { index: 21, row: 3, column: 0, cropX: 84, cropY: 238, type: "good_luck" },
  { index: 22, row: 2, column: 0, cropX: 84, cropY: 168, type: "symbol", symbol: "apple", multiplier: 5 },
  { index: 23, row: 1, column: 0, cropX: 84, cropY: 98, type: "symbol", symbol: "bell", multiplier: 2 },
];

export const bettableSymbols: FruitSymbol[] = [
  "bar", "sevens", "double_star", "watermelon", "bell", "papaya", "orange", "apple",
];

export const symbolDisplayName: Record<FruitSymbol, string> = {
  apple: "苹果",
  watermelon: "西瓜",
  papaya: "木瓜",
  orange: "橙子",
  bell: "铃铛",
  sevens: "77",
  double_star: "双星",
  bar: "BAR",
};

export const symbolBaseMultiplier: Record<FruitSymbol, number> = {
  bar: 50,
  sevens: 20,
  double_star: 20,
  watermelon: 20,
  bell: 10,
  papaya: 10,
  orange: 10,
  apple: 5,
};

export const symbolArtworkTile: Record<FruitSymbol, number> = {
  bar: 3,
  sevens: 15,
  double_star: 19,
  watermelon: 7,
  bell: 1,
  papaya: 6,
  orange: 0,
  apple: 4,
};

