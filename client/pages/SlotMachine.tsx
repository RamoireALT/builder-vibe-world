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
  Dice1,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const SLOT_SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🔔"];
const SYMBOL_VALUES = {
  "🍒": 2,
  "🍋": 3,
  "🍊": 4,
  "🍇": 5,
  "⭐": 10,
  "💎": 20,
  "7️⃣": 50,
  "🔔": 25,
};

export default function SlotMachine() {
  const { user, recordWin, recordLoss, recordGame } = useUser();
  const [reels, setReels] = useState(["🍒", "🍒", "🍒"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastWin, setLastWin] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getRandomSymbol = () => {
    return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
  };

  const calculateWinnings = (symbols: string[]) => {
    // Check for three of a kind
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      const symbolValue =
        SYMBOL_VALUES[symbols[0] as keyof typeof SYMBOL_VALUES];
      return symbolValue * bet;
    }

    // Check for two of a kind
    if (
      symbols[0] === symbols[1] ||
      symbols[1] === symbols[2] ||
      symbols[0] === symbols[2]
    ) {
      const symbol =
        symbols[0] === symbols[1]
          ? symbols[0]
          : symbols[1] === symbols[2]
            ? symbols[1]
            : symbols[0];
      const symbolValue = SYMBOL_VALUES[symbol as keyof typeof SYMBOL_VALUES];
      return Math.floor(symbolValue * bet * 0.3);
    }

    return 0;
  };

  const spin = useCallback(async () => {
    if (isSpinning || bet > user.balance) return;

    setIsSpinning(true);
    setLastWin(0);
    recordGame();
    setTotalSpins((prev) => prev + 1);

    // Simulate spinning animation
    const spinDuration = 2000;
    const spinInterval = 100;
    const spinSteps = spinDuration / spinInterval;

    for (let i = 0; i < spinSteps; i++) {
      setTimeout(() => {
        setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      }, i * spinInterval);
    }

    // Final result
    setTimeout(() => {
      const finalReels = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol(),
      ];
      setReels(finalReels);

      const winnings = calculateWinnings(finalReels);

      if (winnings > 0) {
        recordWin(winnings - bet); // Net win (subtract the bet)
        setLastWin(winnings);
        toast.success(`🎉 You won ${formatCurrency(winnings)}!`, {
          description: `Net profit: ${formatCurrency(winnings - bet)}`,
        });
      } else {
        recordLoss(bet);
        toast.error(`😔 You lost ${formatCurrency(bet)}`, {
          description: "Better luck next time!",
        });
      }

      setIsSpinning(false);
    }, spinDuration);
  }, [bet, user.balance, isSpinning, recordWin, recordLoss, recordGame]);

  const maxBet = () => {
    setBet(Math.min(1000, user.balance));
  };

  const resetGame = () => {
    setReels(["🍒", "🍒", "🍒"]);
    setBet(100);
    setLastWin(0);
    setTotalSpins(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-black via-casino-black-light to-casino-red-dark">
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
              <div className="bg-gradient-to-r from-casino-red to-casino-red-dark p-2 rounded-lg">
                <Dice1 className="h-6 w-6 text-white animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">
                  Slot Machine
                </h1>
                <p className="text-sm text-casino-gold/70">
                  Classic 3-Reel Slots
                </p>
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
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slot Machine */}
            <Card className="bg-gradient-to-b from-casino-black to-casino-black-light border-2 border-casino-gold/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-casino-gold">
                  🎰 Royal Slots 🎰
                </CardTitle>
                <CardDescription className="text-white/70">
                  Match 3 symbols to win big!
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Reels Display */}
                <div className="flex justify-center space-x-4 p-8 bg-casino-black-light rounded-lg border border-casino-gold/20">
                  {reels.map((symbol, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl shadow-lg ${
                        isSpinning ? "animate-pulse-casino" : ""
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>

                {/* Last Win Display */}
                {lastWin > 0 && (
                  <div className="text-center p-4 bg-casino-green/20 rounded-lg border border-casino-green/50">
                    <p className="text-casino-green font-bold text-xl">
                      🎉 Winner! {formatCurrency(lastWin)} 🎉
                    </p>
                  </div>
                )}

                {/* Bet Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bet" className="text-white">
                      Bet Amount
                    </Label>
                    <Input
                      id="bet"
                      type="number"
                      min="10"
                      max={Math.min(1000, user.balance)}
                      step="10"
                      value={bet}
                      onChange={(e) => setBet(Number(e.target.value))}
                      className="bg-casino-black-light border-casino-gold/30 text-white"
                      disabled={isSpinning}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Quick Bet</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBet(Math.min(bet / 2, user.balance))}
                        disabled={isSpinning}
                        className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                      >
                        1/2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={maxBet}
                        disabled={isSpinning}
                        className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Spin Button */}
                <div className="text-center space-y-4">
                  <Button
                    onClick={spin}
                    disabled={isSpinning || bet > user.balance || bet < 10}
                    className="w-full py-6 text-xl font-bold bg-gradient-to-r from-casino-red to-casino-red-dark hover:from-casino-red-dark hover:to-casino-red disabled:opacity-50"
                  >
                    {isSpinning ? (
                      <>
                        <Zap className="h-6 w-6 mr-2 animate-pulse" />
                        SPINNING...
                      </>
                    ) : (
                      <>🎰 SPIN ({formatCurrency(bet)}) 🎰</>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetGame}
                    className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Game
                  </Button>
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
                  <span className="text-white/70">Spins:</span>
                  <span className="text-white font-semibold">{totalSpins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Current Bet:</span>
                  <span className="text-casino-gold font-semibold">
                    {formatCurrency(bet)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Last Win:</span>
                  <span className="text-casino-green font-semibold">
                    {formatCurrency(lastWin)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Paytable */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">Paytable</CardTitle>
                <CardDescription className="text-white/70">
                  3 matching symbols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(SYMBOL_VALUES).map(([symbol, multiplier]) => (
                    <div
                      key={symbol}
                      className="flex justify-between items-center"
                    >
                      <span className="text-2xl">
                        {symbol}
                        {symbol}
                        {symbol}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-casino-gold/20 text-casino-gold"
                      >
                        {multiplier}x
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-4">
                  2 matching symbols pay 30% of the 3-symbol rate
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-casino-purple/20 border-casino-purple/50">
              <CardHeader>
                <CardTitle className="text-casino-purple">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/80 space-y-2">
                <p>• Start with smaller bets to learn the game</p>
                <p>• 💎 and 7️⃣ symbols offer the highest payouts</p>
                <p>• Manage your virtual bankroll wisely</p>
                <p>• Have fun and play responsibly!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
