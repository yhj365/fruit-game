"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  bettableSymbols,
  symbolArtworkTile,
  symbolBaseMultiplier,
  symbolDisplayName,
  tiles,
  type FruitSymbol,
  type FruitTile,
} from "@/lib/gameConfig";

type BetsState = Record<FruitSymbol, number>;

const digitSegments: Record<string, string> = {
  "0": "abcedf",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgecd",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

const segmentNames = ["a", "b", "c", "d", "e", "f", "g"] as const;

/** Creates a new zeroed bet record so state updates never share a mutable object. */
const emptyBets = (): BetsState => ({
  bar: 0,
  sevens: 0,
  double_star: 0,
  watermelon: 0,
  bell: 0,
  papaya: 0,
  orange: 0,
  apple: 0,
});

/** Maps a reference-image crop to a responsive CSS sprite position. */
function artworkPosition(tile: FruitTile): string {
  return `${(tile.cropX / (603 - 66)) * 100}% ${(tile.cropY / (643 - 66)) * 100}%`;
}

/** Gives a board cell a readable result description. */
function tileLabel(tile: FruitTile): string {
  if (tile.type === "good_luck") return "幸运奖励";
  return `${symbolDisplayName[tile.symbol!]}，${tile.multiplier} 倍`;
}

/** Renders a numeric value with the cabinet's LED treatment. */
function LedNumber({ value, red = false }: { value: number; red?: boolean }): ReactElement {
  const digits = String(value).padStart(2, "0").split("");
  return (
    <span className={`arcade-led ${red ? "arcade-led-red" : ""} ${value >= 100 ? "arcade-led-wide" : ""}`} aria-label={`${value}`}>
      {digits.map((digit, digitIndex) => (
        <span className="arcade-led-digit" aria-hidden="true" key={`${digitIndex}-${digit}`}>
          {segmentNames.map((segment) => (
            <i className={`arcade-segment arcade-segment-${segment} ${digitSegments[digit].includes(segment) ? "arcade-segment-on" : ""}`} key={segment} />
          ))}
        </span>
      ))}
    </span>
  );
}

/** Runs the local arcade game and presents the reference cabinet interface. */
export default function GamePage(): ReactElement {
  const [balance, setBalance] = useState(100);
  const [bets, setBets] = useState<BetsState>(emptyBets);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<FruitTile | null>(null);
  const [history, setHistory] = useState<FruitTile[]>([]);
  const [lastWin, setLastWin] = useState(0);
  const [pendingWin, setPendingWin] = useState(0);
  const [riskAmount, setRiskAmount] = useState(0);
  const [guessNumber, setGuessNumber] = useState<number | null>(null);
  const [notice, setNotice] = useState("请选择下方图案下注，按开始键跑灯。");
  const [countdown, setCountdown] = useState(15);
  const currentIndexRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalBet = bettableSymbols.reduce((sum, symbol) => sum + bets[symbol], 0);

  useEffect(() => {
    if (isSpinning || pendingWin > 0) return;
    const timer = setInterval(() => setCountdown((value) => (value <= 1 ? 15 : value - 1)), 1000);
    return () => clearInterval(timer);
  }, [isSpinning, pendingWin]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  /** Transfers the current pending award into the local balance. */
  const collectWin = (): void => {
    if (pendingWin <= 0) return;
    setBalance((value) => value + pendingWin);
    setNotice(`已收取 ${pendingWin} 积分，可以继续使用当前下注。`);
    setPendingWin(0);
    setRiskAmount(0);
    setCountdown(15);
  };

  /** Changes one symbol's stake by one credit, collecting a prior win first. */
  const changeBet = (symbol: FruitSymbol, delta: 1 | -1): void => {
    if (isSpinning) return;
    if (pendingWin > 0) collectWin();
    setBets((previous) => ({
      ...previous,
      [symbol]: Math.min(99, Math.max(0, previous[symbol] + delta)),
    }));
    setNotice("下注已更新，按开始键跑灯。");
  };

  /** Clears all stakes between rounds. */
  const clearBets = (): void => {
    if (isSpinning) return;
    if (pendingWin > 0) collectWin();
    setBets(emptyBets());
    setNotice("下注已清空，请重新选择图案。");
  };

  /** Animates one clockwise pass and resolves to its final tile. */
  const spinOnce = (): Promise<FruitTile> => new Promise((resolve) => {
    const steps = 48 + Math.floor(Math.random() * 48);
    let completed = 0;
    intervalRef.current = setInterval(() => {
      const nextIndex = ((currentIndexRef.current ?? -1) + 1) % tiles.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      completed += 1;
      if (completed >= steps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        resolve(tiles[nextIndex]);
      }
    }, 45);
  });

  /** Starts a paid round, including two bonus spins after an initial LUCK result. */
  const start = async (): Promise<void> => {
    if (isSpinning) return;
    if (pendingWin > 0) {
      collectWin();
      return;
    }
    if (totalBet === 0) {
      setNotice("请先选择至少一个图案下注。");
      return;
    }
    if (totalBet > balance) {
      setNotice("余额不足，请减少下注后再开始。");
      return;
    }

    const stake = { ...bets };
    setBalance((value) => value - totalBet);
    setLastWin(0);
    setLastResult(null);
    setGuessNumber(null);
    setIsSpinning(true);
    setNotice("跑灯中，请等待结果。");

    let roundWin = 0;
    let bonusSpins = 0;
    for (let spin = 0; spin <= bonusSpins; spin += 1) {
      const result = await spinOnce();
      setLastResult(result);
      setHistory((previous) => [result, ...previous].slice(0, 10));
      if (result.type === "good_luck" && spin === 0) {
        bonusSpins = 2;
        setNotice("GOOD LUCK！加送两次跑灯。");
      } else if (result.type === "symbol" && result.symbol) {
        roundWin += stake[result.symbol] * (result.multiplier ?? 0);
      }
    }

    setLastWin(roundWin);
    setPendingWin(roundWin);
    setRiskAmount(roundWin);
    setIsSpinning(false);
    setCountdown(15);
    setNotice(roundWin > 0
      ? `本局赢得 ${roundWin} 积分。可以收分或猜大小。`
      : "本局未中奖，可以调整下注或再试一次。");
  };

  /** Risks the selected part of a pending award on a number from 1 to 14. */
  const guess = (choice: "small" | "big"): void => {
    if (pendingWin <= 0 || isSpinning) return;
    const drawn = Math.floor(Math.random() * 14) + 1;
    const correct = choice === "small" ? drawn <= 7 : drawn >= 8;
    const newWin = correct ? pendingWin + riskAmount : pendingWin - riskAmount;
    setGuessNumber(drawn);
    setPendingWin(newWin);
    setRiskAmount(newWin);
    setNotice(correct
      ? `开出 ${drawn}，猜对了！当前待收取 ${newWin} 积分。`
      : `开出 ${drawn}，猜错了。${newWin > 0 ? `还可收取 ${newWin} 积分。` : "本局积分已用完。"}`);
  };

  return (
    <div className="arcade-page">
      <div className="arcade-machine">
        <div className="arcade-top-lights" aria-hidden="true"><i /><i /><i /></div>
        <div className="arcade-upper">
          <aside className="arcade-history" aria-label="历史记录">
            <div className="arcade-history-title">历史<br />记录</div>
            <div className="arcade-history-arrow" aria-hidden="true" />
            <div className="arcade-history-list">
              {Array.from({ length: 10 }, (_, index) => {
                const result = history[index];
                return (
                  <div className="arcade-history-slot" key={index} aria-label={result ? tileLabel(result) : "暂无记录"}>
                    {result && <span className="arcade-sprite" style={{ backgroundPosition: artworkPosition(result) }} />}
                  </div>
                );
              })}
            </div>
            <div className="arcade-history-arrow arcade-history-arrow-down" aria-hidden="true" />
          </aside>

          <div className="arcade-board-frame">
            <div className="arcade-board">
              <div className="arcade-stage">
                <div className="arcade-message-panel">
                  <strong>{isSpinning ? "开奖时间" : pendingWin > 0 ? "中奖结算" : "下注时间"}</strong>
                  <span>{isSpinning ? "跑灯进行中" : pendingWin > 0 ? guessNumber !== null ? `开出 ${guessNumber}，可收分或继续猜` : "收分或猜大小" : "点击下方图案下注，按开始键跑灯"}</span>
                </div>
                <div className="arcade-center-display">
                  <LedNumber value={isSpinning ? (currentIndex ?? 0) + 1 : pendingWin > 0 ? pendingWin : countdown} red />
                </div>
              </div>
              {tiles.map((tile) => (
                <div
                  className={`arcade-tile ${currentIndex === tile.index ? "arcade-tile-active" : ""}`}
                  key={tile.index}
                  style={{ gridRow: tile.row + 1, gridColumn: tile.column + 1 }}
                  role="img"
                  aria-label={tileLabel(tile)}
                >
                  <span className="arcade-sprite" style={{ backgroundPosition: artworkPosition(tile) }} />
                  <span className="arcade-bulb" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="arcade-scoreboard" aria-label="当前积分和下注">
          <div className="arcade-scoreboard-label">计分板</div>
          {bettableSymbols.map((symbol) => (
            <div className="arcade-score-slot" key={symbol} aria-label={`${symbolDisplayName[symbol]}下注 ${bets[symbol]}`}>
              <LedNumber value={bets[symbol]} />
            </div>
          ))}
        </div>

        <div className="arcade-bets" aria-label="选择下注图案">
          {bettableSymbols.map((symbol) => {
            const art = tiles[symbolArtworkTile[symbol]];
            return (
              <div className="arcade-bet" key={symbol}>
                <button
                  className={`arcade-bet-face ${bets[symbol] > 0 ? "arcade-bet-selected" : ""}`}
                  type="button"
                  onClick={() => changeBet(symbol, 1)}
                  disabled={isSpinning}
                  aria-label={`增加${symbolDisplayName[symbol]}下注，当前 ${bets[symbol]}`}
                >
                  <span className="arcade-bet-art arcade-sprite" style={{ backgroundPosition: artworkPosition(art) }} aria-hidden="true" />
                  <span className="arcade-bet-odds">×{symbolBaseMultiplier[symbol]}</span>
                </button>
                <div className="arcade-bet-footer">
                  <span>{symbolDisplayName[symbol]}</span>
                  <button type="button" onClick={() => changeBet(symbol, -1)} disabled={isSpinning || bets[symbol] === 0} aria-label={`减少${symbolDisplayName[symbol]}下注`}>−</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="arcade-controls">
          <div className="arcade-totals">
            <span>余额 <strong>{balance}</strong></span>
            <span>本局下注 <strong>{totalBet}</strong></span>
            <span>本局中奖 <strong>{lastWin}</strong></span>
            {pendingWin > 0 && <span>待收取 <strong>{pendingWin}</strong></span>}
          </div>
          <p className="arcade-notice" role="status">{notice}</p>
          <div className="arcade-actions">
            <button type="button" className="arcade-action-utility" onClick={clearBets} disabled={isSpinning}>清空下注</button>
            {pendingWin > 0 && (
              <div className="arcade-guess-controls" aria-label="猜大小">
                <button type="button" onClick={() => setRiskAmount((value) => Math.max(1, Math.floor(value / 2)))} disabled={riskAmount <= 1}>减半</button>
                <span>参与 {riskAmount}</span>
                <button type="button" onClick={() => setRiskAmount((value) => Math.min(pendingWin, value * 2))} disabled={riskAmount >= pendingWin}>加倍</button>
                <button type="button" onClick={() => guess("small")}>猜小 1–7</button>
                <button type="button" onClick={() => guess("big")}>猜大 8–14</button>
              </div>
            )}
            <button type="button" className="arcade-action-primary" onClick={start} disabled={isSpinning}>
              {isSpinning ? "跑灯中" : pendingWin > 0 ? "收分" : "开始"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
