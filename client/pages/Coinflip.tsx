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
  Coins,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type CoinSide = "heads" | "tails";

export default function Coinflip() {
  const { user, recordWin, recordLoss, recordGame } = useUser();
  const [isFlipping, setIsFlipping] = useState(false);
  const [bet, setBet] = useState(100);
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastResult, setLastResult] = useState<CoinSide | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [totalFlips, setTotalFlips] = useState(0);
  const [coinRotation, setCoinRotation] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const flipCoin = useCallback(async () => {
    if (isFlipping || bet > user.balance) return;

    setIsFlipping(true);
    setLastWin(0);
    recordGame();
    setTotalFlips((prev) => prev + 1);

    // Animate coin flip
    const flipDuration = 2000;
    const rotations = 10 + Math.random() * 10; // 10-20 rotations
    setCoinRotation(rotations * 360);

    // Determine result
    const result: CoinSide = Math.random() < 0.5 ? "heads" : "tails";

    setTimeout(() => {
      setLastResult(result);
      setIsFlipping(false);

      const won = result === selectedSide;
      const winnings = won ? bet * 2 : 0; // 2x payout for winning

      if (won) {
        recordWin(bet); // Net win (bet amount)
        setLastWin(winnings);
        toast.success(`🎉 You won ${formatCurrency(winnings)}!`, {
          description: `You guessed ${selectedSide} correctly!`,
        });
      } else {
        recordLoss(bet);
        toast.error(`😔 You lost ${formatCurrency(bet)}`, {
          description: `It was ${result}, you guessed ${selectedSide}`,
        });
      }
    }, flipDuration);
  }, [
    bet,
    user.balance,
    isFlipping,
    selectedSide,
    recordWin,
    recordLoss,
    recordGame,
  ]);

  const maxBet = () => {
    setBet(Math.min(5000, user.balance));
  };

  const resetGame = () => {
    setLastResult(null);
    setBet(100);
    setLastWin(0);
    setTotalFlips(0);
    setCoinRotation(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-black via-casino-black-light to-casino-gold-dark">
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
              <div className="bg-gradient-to-r from-casino-gold to-casino-gold-dark p-2 rounded-lg">
                <Coins className="h-6 w-6 text-white animate-pulse-casino" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">Coinflip</h1>
                <p className="text-sm text-casino-gold/70">Heads or Tails</p>
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
            {/* Coinflip Game */}
            <Card className="bg-gradient-to-b from-casino-black to-casino-black-light border-2 border-casino-gold/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-casino-gold">
                  🪙 Coinflip 🪙
                </CardTitle>
                <CardDescription className="text-white/70">
                  Choose heads or tails and double your money!
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Coin Display */}
                <div className="flex justify-center p-8 bg-casino-black-light rounded-lg border border-casino-gold/20">
                  <div
                    className="relative w-32 h-32"
                    style={{
                      transform: `rotateY(${coinRotation}deg)`,
                      transition: isFlipping ? "transform 2s ease-out" : "none",
                    }}
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-casino-gold to-casino-gold-dark rounded-full flex items-center justify-center text-6xl shadow-lg border-4 border-white">
                      {lastResult === "heads"
                        ? "👑"
                        : lastResult === "tails"
                          ? "⚡"
                          : "🪙"}
                    </div>
                  </div>
                </div>

                {/* Result Display */}
                {lastResult && (
                  <div
                    className={`text-center p-4 rounded-lg border ${
                      lastWin > 0
                        ? "bg-casino-green/20 border-casino-green/50"
                        : "bg-casino-red/20 border-casino-red/50"
                    }`}
                  >
                    <p
                      className={`font-bold text-xl ${
                        lastWin > 0 ? "text-casino-green" : "text-casino-red"
                      }`}
                    >
                      {lastResult === "heads" ? "👑 HEADS!" : "⚡ TAILS!"}
                      {lastWin > 0 && ` - Won ${formatCurrency(lastWin)}!`}
                    </p>
                  </div>
                )}

                {/* Side Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={selectedSide === "heads" ? "default" : "outline"}
                    onClick={() => setSelectedSide("heads")}
                    disabled={isFlipping}
                    className={`py-8 text-lg ${
                      selectedSide === "heads"
                        ? "bg-gradient-to-r from-casino-gold to-casino-gold-dark text-casino-black"
                        : "border-casino-gold text-casino-gold hover:bg-casino-gold/20"
                    }`}
                  >
                    👑 HEADS
                  </Button>
                  <Button
                    variant={selectedSide === "tails" ? "default" : "outline"}
                    onClick={() => setSelectedSide("tails")}
                    disabled={isFlipping}
                    className={`py-8 text-lg ${
                      selectedSide === "tails"
                        ? "bg-gradient-to-r from-casino-gold to-casino-gold-dark text-casino-black"
                        : "border-casino-gold text-casino-gold hover:bg-casino-gold/20"
                    }`}
                  >
                    ⚡ TAILS
                  </Button>
                </div>

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
                      max={Math.min(5000, user.balance)}
                      step="10"
                      value={bet}
                      onChange={(e) => setBet(Number(e.target.value))}
                      className="bg-casino-black-light border-casino-gold/30 text-white"
                      disabled={isFlipping}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Quick Bet</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBet(Math.max(10, bet / 2))}
                        disabled={isFlipping}
                        className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                      >
                        1/2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={maxBet}
                        disabled={isFlipping}
                        className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Flip Button */}
                <div className="text-center space-y-4">
                  <Button
                    onClick={flipCoin}
                    disabled={isFlipping || bet > user.balance || bet < 10}
                    className="w-full py-6 text-xl font-bold bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black disabled:opacity-50"
                  >
                    {isFlipping ? (
                      <>
                        <Zap className="h-6 w-6 mr-2 animate-pulse" />
                        FLIPPING...
                      </>
                    ) : (
                      <>🪙 FLIP ({formatCurrency(bet)}) 🪙</>
                    )}
                  </Button>

                  <p className="text-casino-gold/70 text-sm">
                    You chose:{" "}
                    {selectedSide === "heads" ? "👑 HEADS" : "⚡ TAILS"} • 2x
                    payout if you win
                  </p>

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
                  <span className="text-white/70">Flips:</span>
                  <span className="text-white font-semibold">{totalFlips}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Current Bet:</span>
                  <span className="text-casino-gold font-semibold">
                    {formatCurrency(bet)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Selected:</span>
                  <span className="text-casino-gold font-semibold">
                    {selectedSide === "heads" ? "👑 HEADS" : "⚡ TAILS"}
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

            {/* Game Rules */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">1.</span>
                  <span>Choose your bet amount</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">2.</span>
                  <span>Select Heads (👑) or Tails (⚡)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">3.</span>
                  <span>Click flip and watch the coin!</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">4.</span>
                  <span>Win double your bet if you guess correctly</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-casino-purple/20 border-casino-purple/50">
              <CardHeader>
                <CardTitle className="text-casino-purple">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/80 space-y-2">
                <p>• Each flip has a 50/50 chance</p>
                <p>• Start with smaller bets to get a feel</p>
                <p>• 2x payout means you double your money</p>
                <p>• No patterns - each flip is random!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
