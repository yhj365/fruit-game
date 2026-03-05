"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  bettableSymbols,
  symbolDisplayName,
  tiles,
  type FruitSymbol,
  type FruitTile,
} from "@/lib/gameConfig";

type BetsState = Record<FruitSymbol, number>;

const initialBets: BetsState = {
  apple: 0,
  watermelon: 0,
  papaya: 0,
  orange: 0,
  bell: 0,
  sevens: 0,
  double_star: 0,
  bar: 0,
};

const symbolImageMap: Record<FruitSymbol, string> = {
  apple: "/images/symbols/apple_large.svg",
  watermelon: "/images/symbols/watermelon_large.svg",
  papaya: "/images/symbols/papaya_large.svg",
  orange: "/images/symbols/orange_large.svg",
  bell: "/images/symbols/bell_large.svg",
  sevens: "/images/symbols/seven77_large.svg",
  double_star: "/images/symbols/double_star_large.svg",
  bar: "/images/symbols/bar_large.svg",
};

export default function GamePage() {
  const [balance, setBalance] = useState<number>(100);
  const [bets, setBets] = useState<BetsState>(initialBets);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<FruitTile | null>(null);
  const [lastWin, setLastWin] = useState(0);

  const payoutMap = useMemo(() => {
    const base: Record<FruitSymbol, number> = {
      apple: 0,
      watermelon: 0,
      papaya: 0,
      orange: 0,
      bell: 0,
      sevens: 0,
      double_star: 0,
      bar: 0,
    };

    tiles.forEach((tile) => {
      if (tile.type === "symbol" && tile.symbol && tile.multiplier) {
        const symbol = tile.symbol;
        base[symbol] = Math.max(base[symbol], tile.multiplier);
      }
    });

    return base;
  }, []);

  const totalBet = useMemo(
    () => Object.values(bets).reduce((sum, v) => sum + v, 0),
    [bets],
  );

  const handleChangeBet = (symbol: FruitSymbol, delta: 1 | -1) => {
    setBets((prev) => {
      const next = { ...prev };
      const current = next[symbol] ?? 0;
      const updated = Math.max(0, current + delta);
      next[symbol] = updated;
      return next;
    });
  };

  const handleResetBets = () => {
    setBets(initialBets);
  };

  const handleStart = () => {
    if (isSpinning) return;

    const snapshotBets = { ...bets };
    const snapshotTotalBet = Object.values(snapshotBets).reduce(
      (sum, v) => sum + v,
      0,
    );

    if (snapshotTotalBet <= 0) {
      // 简单提示，后续可以换成更好的 UI 提示
      alert("请先在下方选择水果并下注");
      return;
    }

    if (balance < snapshotTotalBet) {
      alert("余额不足，请减少下注或充值");
      return;
    }

    setIsSpinning(true);
    setLastWin(0);
    setBalance((prev) => prev - snapshotTotalBet);

    const steps =
      tiles.length * 3 + Math.floor(Math.random() * tiles.length * 2);
    let step = 0;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex =
          prev === null ? step % tiles.length : (prev + 1) % tiles.length;
        return nextIndex;
      });

      step += 1;

      if (step > steps) {
        clearInterval(interval);

        setCurrentIndex((prev) => {
          const finalIndex = prev ?? 0;
          const finalTile = tiles[finalIndex];
          setLastResult(finalTile);

          let win = 0;
          if (finalTile.type === "symbol" && finalTile.symbol) {
            const betAmount = snapshotBets[finalTile.symbol] ?? 0;
            const multiplier = finalTile.multiplier ?? 0;
            win = betAmount * multiplier;
          } else if (finalTile.type === "good_luck") {
            // 先简单处理：GOOD LUCK 固定送一个小奖励
            win = snapshotTotalBet * 2;
          }

          if (win > 0) {
            setLastWin(win);
            setBalance((prevBalance) => prevBalance + win);
          }

          setIsSpinning(false);
          return finalIndex;
        });
      }
    }, 90);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* 上方：480x480 主游戏盘面 */}
      <section className="flex flex-1 items-center justify-center">
        <div className="fruit-border relative aspect-square w-full max-w-[480px] bg-slate-950/80 p-4">
          {/* 外圈 24 格：用 6x4 网格简单排布，视觉上接近参考图 */}
          <div className="grid grid-cols-6 grid-rows-4 gap-2">
            {tiles.map((tile) => {
              const isActive = currentIndex === tile.index && isSpinning;
              const isResult =
                currentIndex === tile.index && !isSpinning && lastResult;

              return (
                <div
                  key={tile.index}
                  className="relative h-20 w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  {/* 高亮灯光 */}
                  <div
                    className={`fruit-tile-light ${
                      isActive || isResult ? "fruit-tile-light-on" : ""
                    }`}
                  />
                  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 px-1">
                    {tile.type === "symbol" && tile.symbol ? (
                      <>
                        <div className="h-10 w-10">
                          <Image
                            src={symbolImageMap[tile.symbol]}
                            alt={symbolDisplayName[tile.symbol]}
                            width={64}
                            height={64}
                          />
                        </div>
                        <div className="text-xs font-semibold text-fruit-gold">
                          x{tile.multiplier ?? 1}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs font-bold text-fruit-gold">
                        <span className="rounded bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 px-2 py-1 text-slate-900 shadow-glow-gold">
                          GOOD LUCK
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 中央信息面板 */}
          <div className="pointer-events-none absolute inset-10 flex items-center justify-center">
            <div className="pointer-events-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl bg-sky-900/90 px-6 py-4 shadow-2xl shadow-black/60">
              <div className="text-sm text-slate-100">
                <div className="text-xs text-slate-300">状态</div>
                <div className="text-lg font-semibold text-fruit-gold">
                  {isSpinning
                    ? "跑灯中..."
                    : lastResult
                    ? "本局结果"
                    : "等待开始"}
                </div>
              </div>
              <div className="flex w-full justify-between text-xs text-slate-200">
                <div>
                  <div className="text-slate-400">当前余额</div>
                  <div className="mt-1 text-base font-semibold text-fruit-gold">
                    {balance}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">本局总下注</div>
                  <div className="mt-1 text-base font-semibold text-emerald-300">
                    {totalBet}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">本局中奖</div>
                  <div className="mt-1 text-base font-semibold text-rose-300">
                    {lastWin}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 下方：押注水果一排 + 右侧开始按钮 */}
      <section className="flex w-full max-w-4xl items-stretch gap-4">
        {/* 押注水果区 */}
        <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-slate-950/80 p-3 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="font-semibold text-fruit-gold">押注区</div>
            <div>
              本局总下注：
              <span className="ml-1 font-semibold text-emerald-300">
                {totalBet}
              </span>
            </div>
          </div>

          <div className="mt-1 flex gap-3 overflow-x-auto pb-1">
            {bettableSymbols.map((symbol) => (
              <div
                key={symbol}
                className="flex min-w-[80px] flex-col items-center rounded-xl bg-slate-900/80 px-2 py-2">
                <div className="text-[10px] text-fruit-gold">
                  奖励：x{payoutMap[symbol] ?? 0}
                </div>
                <div className="mt-1 h-9 w-9">
                  <Image
                    src={symbolImageMap[symbol]}
                    alt={symbolDisplayName[symbol]}
                    width={36}
                    height={36}
                  />
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-100">
                  {symbolDisplayName[symbol]}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleChangeBet(symbol, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-[11px] font-bold text-slate-100 hover:border-fruit-gold hover:text-fruit-gold">
                    -
                  </button>
                  <div className="w-9 text-center text-xs font-semibold text-fruit-gold">
                    {bets[symbol] ?? 0}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChangeBet(symbol, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-fruit-gold text-[11px] font-bold text-slate-900 shadow-glow-gold hover:bg-yellow-300">
                    +
                  </button>
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  押注积分
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-200">
            <div>
              当前余额：
              <span className="ml-1 font-semibold text-fruit-gold">
                {balance}
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetBets}
              className="rounded-lg border border-slate-600 px-3 py-1 text-[11px] font-semibold text-slate-100 hover:border-fruit-gold hover:text-fruit-gold">
              清空下注
            </button>
          </div>
        </div>

        {/* 右侧：开始按钮与信息 */}
        <div className="flex w-28 flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={isSpinning}
            className="flex h-32 w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-fruit-gold to-yellow-400 text-center text-sm font-bold tracking-[0.2em] text-slate-900 shadow-glow-gold transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
            {isSpinning ? "跑灯中" : "开始"}
          </button>
          <div className="w-full rounded-2xl bg-slate-950/80 px-2 py-2 text-[11px] text-slate-200">
            <div>
              本局中奖：
              <span className="ml-1 font-semibold text-rose-300">
                {lastWin}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
