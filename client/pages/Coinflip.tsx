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
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type CoinSide = "heads" | "tails";

const WIN_MULTIPLIERS = [2, 4, 6, 8, 10, 20, 30, 40, 50, 100];
const MAX_WINS = 10;

export default function Coinflip() {
  const { user, recordWin, recordLoss, recordGame } = useUser();
  const [isFlipping, setIsFlipping] = useState(false);
  const [bet, setBet] = useState(100);
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWins, setCurrentWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [coinRotation, setCoinRotation] = useState(0);
  const [gameHistory, setGameHistory] = useState<CoinSide[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getCurrentMultiplier = () => {
    if (currentWins === 0) return 1;
    return WIN_MULTIPLIERS[
      Math.min(currentWins - 1, WIN_MULTIPLIERS.length - 1)
    ];
  };

  const getNextMultiplier = () => {
    if (currentWins >= MAX_WINS)
      return WIN_MULTIPLIERS[WIN_MULTIPLIERS.length - 1];
    return WIN_MULTIPLIERS[currentWins];
  };

  const getCurrentWinAmount = () => {
    if (currentWins === 0) return 0;
    return Math.floor(bet * getCurrentMultiplier());
  };

  const startNewGame = () => {
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    recordLoss(bet, "Coinflip"); // Take the bet upfront
    setGameStarted(true);
    setCurrentWins(0);
    setGameHistory([]);
    setTotalGames((prev) => prev + 1);
    recordGame();
  };

  const flipCoin = useCallback(async () => {
    if (isFlipping || !gameStarted || currentWins >= MAX_WINS) return;

    setIsFlipping(true);

    // Animate coin flip
    const flipDuration = 2000;
    const rotations = 10 + Math.random() * 10;
    setCoinRotation((prev) => prev + rotations * 360);

    // Determine result (50/50 chance)
    const result: CoinSide = Math.random() < 0.5 ? "heads" : "tails";

    setTimeout(() => {
      setGameHistory((prev) => [...prev, result]);
      const won = result === selectedSide;

      if (won) {
        const newWins = currentWins + 1;
        setCurrentWins(newWins);

        toast.success(`🎉 Correct! ${newWins} wins in a row!`, {
          description: `Current multiplier: ${getNextMultiplier()}x${newWins >= MAX_WINS ? " (MAX REACHED!)" : ""}`,
        });

        if (newWins >= MAX_WINS) {
          toast.success("🏆 Maximum wins reached! You must cash out now!");
        }
      } else {
        // Lost - game over
        setGameStarted(false);
        toast.error(`😔 Wrong! It was ${result}. Game over!`, {
          description:
            currentWins > 0
              ? `You lost a ${getCurrentMultiplier()}x multiplier!`
              : "No wins to lose",
        });
      }

      setIsFlipping(false);
    }, flipDuration);
  }, [
    bet,
    isFlipping,
    gameStarted,
    selectedSide,
    currentWins,
    getCurrentMultiplier,
    getNextMultiplier,
  ]);

  const cashOut = () => {
    if (!gameStarted || currentWins === 0) return;

    const winAmount = getCurrentWinAmount();
    recordWin(winAmount, "Coinflip", bet, getCurrentMultiplier());

    setGameStarted(false);
    toast.success(`💰 Cashed out! You won ${formatCurrency(winAmount)}!`, {
      description: `${currentWins} wins with ${getCurrentMultiplier()}x multiplier`,
    });
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentWins(0);
    setGameHistory([]);
    setTotalGames(0);
    setCoinRotation(0);
  };

  const maxBet = () => {
    setBet(Math.min(5000, user.balance));
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
                <Coins className="h-6 w-6 text-casino-black animate-pulse-casino" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">
                  Progressive Coinflip
                </h1>
                <p className="text-sm text-casino-gold/70">
                  Win up to 100x your bet!
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

            {/* Progressive Coinflip Game */}
            <Card className="bg-gradient-to-b from-casino-black to-casino-black-light border-2 border-casino-gold/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-casino-gold">
                  🪙 Progressive Coinflip 🪙
                </CardTitle>
                <CardDescription className="text-white/70">
                  {gameStarted
                    ? `${currentWins} wins in a row • Next: ${getNextMultiplier()}x`
                    : "Choose heads or tails and build your multiplier!"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Current Game Stats */}
                {gameStarted && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-casino-black-light rounded-lg">
                    <div className="text-center">
                      <p className="text-casino-gold font-semibold">
                        Current Wins
                      </p>
                      <p className="text-2xl text-casino-green">
                        {currentWins}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-casino-gold font-semibold">
                        Current Value
                      </p>
                      <p className="text-2xl text-casino-gold">
                        {formatCurrency(getCurrentWinAmount())}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-casino-gold font-semibold">
                        Next Multiplier
                      </p>
                      <p className="text-2xl text-casino-purple">
                        {getNextMultiplier()}x
                      </p>
                    </div>
                  </div>
                )}

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
                      {gameHistory.length > 0
                        ? gameHistory[gameHistory.length - 1] === "heads"
                          ? "👑"
                          : "⚡"
                        : "🪙"}
                    </div>
                  </div>
                </div>

                {/* Game History */}
                {gameHistory.length > 0 && (
                  <div className="text-center p-4 bg-casino-black-light rounded-lg">
                    <p className="text-casino-gold font-semibold mb-2">
                      Game History
                    </p>
                    <div className="flex justify-center space-x-2 flex-wrap">
                      {gameHistory.map((result, index) => (
                        <span
                          key={index}
                          className="text-2xl p-1 bg-casino-green/20 rounded border border-casino-green/50"
                        >
                          {result === "heads" ? "👑" : "⚡"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Selection */}
                {gameStarted && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={selectedSide === "heads" ? "default" : "outline"}
                      onClick={() => setSelectedSide("heads")}
                      disabled={isFlipping || currentWins >= MAX_WINS}
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
                      disabled={isFlipping || currentWins >= MAX_WINS}
                      className={`py-8 text-lg ${
                        selectedSide === "tails"
                          ? "bg-gradient-to-r from-casino-gold to-casino-gold-dark text-casino-black"
                          : "border-casino-gold text-casino-gold hover:bg-casino-gold/20"
                      }`}
                    >
                      ⚡ TAILS
                    </Button>
                  </div>
                )}

                {/* Game Controls */}
                <div className="text-center space-y-4">
                  {!gameStarted ? (
                    <Button
                      onClick={startNewGame}
                      disabled={bet > user.balance || bet < 10}
                      className="w-full py-6 text-xl font-bold bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black disabled:opacity-50"
                    >
                      🪙 Start Game ({formatCurrency(bet)}) 🪙
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={flipCoin}
                        disabled={isFlipping || currentWins >= MAX_WINS}
                        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-casino-red to-casino-red-dark hover:from-casino-red-dark hover:to-casino-red disabled:opacity-50"
                      >
                        {isFlipping ? (
                          <>
                            <Zap className="h-6 w-6 mr-2 animate-pulse" />
                            FLIPPING...
                          </>
                        ) : currentWins >= MAX_WINS ? (
                          "🏆 MAX WINS REACHED!"
                        ) : (
                          <>
                            🪙 FLIP ({selectedSide === "heads" ? "👑" : "⚡"})
                            🪙
                          </>
                        )}
                      </Button>

                      {currentWins > 0 && (
                        <Button
                          onClick={cashOut}
                          className="w-full py-4 text-lg font-bold bg-gradient-to-r from-casino-green to-casino-green-dark hover:from-casino-green-dark hover:to-casino-green"
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

                  {gameStarted && (
                    <p className="text-casino-gold/70 text-sm">
                      Win {currentWins + 1} in a row for {getNextMultiplier()}x
                      multiplier
                      {currentWins >= MAX_WINS - 1 && " (MAX)"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Multiplier Table */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">
                  Win Multipliers
                </CardTitle>
                <CardDescription className="text-white/70">
                  Progressive multipliers for consecutive wins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {WIN_MULTIPLIERS.map((multiplier, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 rounded ${
                        gameStarted && currentWins === index + 1
                          ? "bg-casino-green/20 border border-casino-green/50"
                          : gameStarted && currentWins > index + 1
                            ? "bg-casino-gold/10"
                            : "bg-casino-black/30"
                      }`}
                    >
                      <span className="text-white">
                        {index + 1} win{index + 1 > 1 ? "s" : ""}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`${
                          gameStarted && currentWins === index + 1
                            ? "bg-casino-green text-white"
                            : gameStarted && currentWins > index + 1
                              ? "bg-casino-gold/20 text-casino-gold"
                              : "bg-casino-purple/20 text-casino-purple"
                        }`}
                      >
                        {multiplier}x
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                  <span className="text-white/70">Current Wins:</span>
                  <span className="text-casino-green font-semibold">
                    {currentWins}
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
                  <span>Set your bet and start the game</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">2.</span>
                  <span>Choose heads or tails for each flip</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">3.</span>
                  <span>Each correct guess increases your multiplier</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">4.</span>
                  <span>
                    Cash out anytime or risk it for higher multipliers
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">5.</span>
                  <span>Wrong guess = lose everything and start over</span>
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
                <p>• Each flip is 50/50 - no patterns exist</p>
                <p>• Consider cashing out at 4-6 wins for safer profits</p>
                <p>• Higher multipliers = higher risk</p>
                <p>• Maximum is 10 wins for 100x multiplier</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
