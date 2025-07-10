import { useState, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  ArrowLeft,
  TrendingUp,
  Volume2,
  VolumeX,
  RotateCcw,
  Crown,
  Skull,
} from "lucide-react";
import { toast } from "sonner";

interface TowerLevel {
  level: number;
  difficulty: number; // Number of safe blocks out of 3
  multiplier: number;
  revealed: boolean;
  selectedBlock?: number;
  safeBlocks: number[];
}

export default function Tower() {
  const { user, recordWin, recordLoss, recordGame } = useUser();
  const [bet, setBet] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [tower, setTower] = useState<TowerLevel[]>([]);

  const TOWER_CONFIG = [
    { level: 1, difficulty: 2, multiplier: 1.5 },
    { level: 2, difficulty: 2, multiplier: 2.25 },
    { level: 3, difficulty: 2, multiplier: 3.38 },
    { level: 4, difficulty: 2, multiplier: 5.06 },
    { level: 5, difficulty: 2, multiplier: 7.59 },
    { level: 6, difficulty: 2, multiplier: 11.39 },
    { level: 7, difficulty: 2, multiplier: 17.09 },
    { level: 8, difficulty: 2, multiplier: 25.63 },
    { level: 9, difficulty: 1, multiplier: 38.44 },
    { level: 10, difficulty: 1, multiplier: 76.88 },
    { level: 11, difficulty: 1, multiplier: 153.76 },
    { level: 12, difficulty: 1, multiplier: 307.52 },
    { level: 13, difficulty: 1, multiplier: 615.04 },
    { level: 14, difficulty: 1, multiplier: 1230.08 },
    { level: 15, difficulty: 1, multiplier: 2460.16 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const initializeTower = useCallback(() => {
    const newTower: TowerLevel[] = TOWER_CONFIG.map((config) => ({
      ...config,
      revealed: false,
      safeBlocks: generateSafeBlocks(config.difficulty),
    }));
    setTower(newTower);
  }, []);

  const generateSafeBlocks = (difficulty: number): number[] => {
    const blocks: number[] = [];
    while (blocks.length < difficulty) {
      const block = Math.floor(Math.random() * 3);
      if (!blocks.includes(block)) {
        blocks.push(block);
      }
    }
    return blocks;
  };

  const startGame = () => {
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    recordLoss(bet, "Tower");
    recordGame();
    setTotalGames((prev) => prev + 1);
    initializeTower();
    setGameStarted(true);
    setGameOver(false);
    setCurrentLevel(0);
  };

  const selectBlock = (level: number, blockIndex: number) => {
    if (!gameStarted || gameOver || level !== currentLevel) return;

    const currentTowerLevel = tower[level];
    const isSafe = currentTowerLevel.safeBlocks.includes(blockIndex);

    // Update tower with selection
    const newTower = [...tower];
    newTower[level] = {
      ...currentTowerLevel,
      revealed: true,
      selectedBlock: blockIndex,
    };
    setTower(newTower);

    if (isSafe) {
      // Safe block - move to next level
      const newLevel = currentLevel + 1;
      setCurrentLevel(newLevel);

      if (newLevel >= TOWER_CONFIG.length) {
        // Reached the top!
        const winAmount = Math.floor(bet * TOWER_CONFIG[level].multiplier);
        recordWin(winAmount, "Tower", bet, TOWER_CONFIG[level].multiplier);
        setGameOver(true);
        toast.success(
          `🏆 You reached the top! Won ${formatCurrency(winAmount)}!`,
        );
      } else {
        toast.success(
          `✅ Safe! Level ${newLevel + 1} - ${formatCurrency(
            Math.floor(bet * TOWER_CONFIG[level].multiplier),
          )}`,
        );
      }
    } else {
      // Danger block - game over
      setGameOver(true);
      toast.error("💀 You hit a danger block! Game over!");
    }
  };

  const cashOut = () => {
    if (!gameStarted || gameOver || currentLevel === 0) return;

    const lastCompletedLevel = currentLevel - 1;
    const winAmount = Math.floor(
      bet * TOWER_CONFIG[lastCompletedLevel].multiplier,
    );
    recordWin(
      winAmount,
      "Tower",
      bet,
      TOWER_CONFIG[lastCompletedLevel].multiplier,
    );

    setGameStarted(false);
    setGameOver(true);
    toast.success(`💰 Cashed out! You won ${formatCurrency(winAmount)}!`);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setCurrentLevel(0);
    setTower([]);
    setTotalGames(0);
  };

  const maxBet = () => {
    setBet(Math.min(5000, user.balance));
  };

  const getCurrentMultiplier = () => {
    if (currentLevel === 0) return 1;
    return TOWER_CONFIG[currentLevel - 1].multiplier;
  };

  const getCurrentWinAmount = () => {
    if (currentLevel === 0) return 0;
    return Math.floor(bet * getCurrentMultiplier());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-black via-casino-black-light to-casino-green-dark">
      {/* Header */}
      <header className="border-b border-casino-gold/20 bg-casino-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="border-casino-gold text-casino-gold hover:bg-casino-gold hover:text-casino-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lobby
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-casino-green to-casino-green-dark p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white animate-pulse-casino" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">Tower</h1>
                <p className="text-sm text-casino-gold/70">Climb to win big!</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-casino-gold/70">Balance</p>
              <p className="text-lg font-bold text-casino-gold">
                {formatCurrency(user.balance)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="border-casino-gold/50 text-casino-gold/70 hover:bg-casino-gold/20"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Settings */}
            {!gameStarted && (
              <Card className="bg-casino-black/60 border-casino-gold/30">
                <CardHeader>
                  <CardTitle className="text-casino-gold">
                    Game Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bet" className="text-white">
                        Bet Amount
                      </Label>
                      <Input
                        id="bet"
                        type="number"
                        min="10"
                        max={Math.min(5000, user.balance)}
                        step="10"
                        value={bet}
                        onChange={(e) => setBet(Number(e.target.value))}
                        className="bg-casino-black-light border-casino-gold/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Quick Bet</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBet(Math.max(10, bet / 2))}
                          className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                        >
                          1/2
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={maxBet}
                          className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Game Stats */}
            {gameStarted && (
              <Card className="bg-casino-black/60 border-casino-gold/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-casino-gold font-semibold">Level</p>
                      <p className="text-2xl text-white">{currentLevel + 1}</p>
                    </div>
                    <div>
                      <p className="text-casino-gold font-semibold">
                        Current Value
                      </p>
                      <p className="text-2xl text-casino-green">
                        {formatCurrency(getCurrentWinAmount())}
                      </p>
                    </div>
                    <div>
                      <p className="text-casino-gold font-semibold">
                        Multiplier
                      </p>
                      <p className="text-2xl text-casino-purple">
                        {getCurrentMultiplier().toFixed(2)}x
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tower Game */}
            <Card className="bg-gradient-to-b from-casino-black to-casino-black-light border-2 border-casino-gold/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-casino-gold">
                  🗼 Tower Climb 🗼
                </CardTitle>
                <CardDescription className="text-white/70">
                  {gameStarted
                    ? `Level ${currentLevel + 1} - Choose the safe block!`
                    : "Climb the tower, avoid danger blocks!"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tower Display */}
                {gameStarted && (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {/* Show levels in reverse order (top to bottom) */}
                      {tower
                        .slice()
                        .reverse()
                        .map((level, reverseIndex) => {
                          const levelIndex = tower.length - 1 - reverseIndex;
                          const isCurrentLevel = levelIndex === currentLevel;
                          const isCompletedLevel = levelIndex < currentLevel;
                          const isFutureLevel = levelIndex > currentLevel;

                          return (
                            <div
                              key={levelIndex}
                              className={`p-3 rounded-lg border ${
                                isCurrentLevel
                                  ? "bg-casino-gold/20 border-casino-gold animate-pulse"
                                  : isCompletedLevel
                                    ? "bg-casino-green/20 border-casino-green"
                                    : "bg-casino-black/30 border-casino-gold/20"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-casino-gold font-bold">
                                    Level {levelIndex + 1}
                                  </span>
                                  {isCurrentLevel && (
                                    <Crown className="h-4 w-4 text-casino-gold" />
                                  )}
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="bg-casino-purple/20 text-casino-purple"
                                >
                                  {level.multiplier.toFixed(2)}x
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                {[0, 1, 2].map((blockIndex) => {
                                  const isSelected =
                                    level.selectedBlock === blockIndex;
                                  const isSafe =
                                    level.safeBlocks.includes(blockIndex);
                                  const isDanger = !isSafe;
                                  const shouldShowResult =
                                    level.revealed || isCompletedLevel;

                                  return (
                                    <button
                                      key={blockIndex}
                                      onClick={() =>
                                        selectBlock(levelIndex, blockIndex)
                                      }
                                      disabled={
                                        !isCurrentLevel ||
                                        gameOver ||
                                        level.revealed
                                      }
                                      className={`h-12 rounded border-2 transition-all duration-200 ${
                                        isSelected && shouldShowResult
                                          ? isSafe
                                            ? "bg-casino-green border-casino-green text-white"
                                            : "bg-casino-red border-casino-red text-white animate-pulse"
                                          : isCurrentLevel
                                            ? "bg-casino-black-light border-casino-gold/50 hover:bg-casino-gold/20 hover:border-casino-gold cursor-pointer"
                                            : shouldShowResult && isSafe
                                              ? "bg-casino-green/30 border-casino-green/50"
                                              : shouldShowResult && isDanger
                                                ? "bg-casino-red/30 border-casino-red/50"
                                                : "bg-casino-black/50 border-casino-gold/20"
                                      }`}
                                    >
                                      {shouldShowResult ? (
                                        isSelected ? (
                                          isSafe ? (
                                            <Crown className="h-6 w-6 mx-auto" />
                                          ) : (
                                            <Skull className="h-6 w-6 mx-auto" />
                                          )
                                        ) : isSafe ? (
                                          <Crown className="h-4 w-4 mx-auto opacity-50" />
                                        ) : (
                                          <Skull className="h-4 w-4 mx-auto opacity-50" />
                                        )
                                      ) : (
                                        ""
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="mt-2 text-center text-xs text-white/60">
                                {level.difficulty === 2
                                  ? "2 safe blocks"
                                  : "1 safe block"}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Game Controls */}
                <div className="text-center space-y-4">
                  {!gameStarted ? (
                    <Button
                      onClick={startGame}
                      disabled={bet > user.balance || bet < 10}
                      className="w-full py-6 text-xl font-bold bg-gradient-to-r from-casino-green to-casino-green-dark hover:from-casino-green-dark hover:to-casino-green disabled:opacity-50"
                    >
                      🗼 Start Climbing ({formatCurrency(bet)}) 🗼
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      {!gameOver && currentLevel > 0 && (
                        <Button
                          onClick={cashOut}
                          className="w-full py-4 text-lg font-bold bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black"
                        >
                          💰 Cash Out ({formatCurrency(getCurrentWinAmount())})
                          💰
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={resetGame}
                        className="w-full border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        New Game
                      </Button>
                    </div>
                  )}

                  {gameStarted && !gameOver && (
                    <p className="text-casino-gold/70 text-sm">
                      Click a block to climb to the next level
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/70">Games Played:</span>
                  <span className="text-white font-semibold">{totalGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Current Bet:</span>
                  <span className="text-casino-gold font-semibold">
                    {formatCurrency(bet)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Current Level:</span>
                  <span className="text-casino-green font-semibold">
                    {gameStarted ? currentLevel + 1 : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Potential Win:</span>
                  <span className="text-casino-green font-semibold">
                    {formatCurrency(getCurrentWinAmount())}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* How to Play */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">1.</span>
                  <span>Set your bet and start climbing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">2.</span>
                  <span>Each level has 2-3 blocks, some are safe (👑)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">3.</span>
                  <span>Click a safe block to move to the next level</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">4.</span>
                  <span>Cash out anytime to secure your winnings</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">5.</span>
                  <span>Hit a danger block (💀) and lose everything</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-casino-purple/20 border-casino-purple/50">
              <CardHeader>
                <CardTitle className="text-casino-purple">
                  💡 Strategy Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/80 space-y-2">
                <p>• Early levels have 2 safe blocks (66% chance)</p>
                <p>• Later levels have 1 safe block (33% chance)</p>
                <p>• Consider cashing out before hard levels</p>
                <p>• Risk vs reward increases dramatically</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
