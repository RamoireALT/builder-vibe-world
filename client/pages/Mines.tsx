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
  Spade,
  Volume2,
  VolumeX,
  RotateCcw,
  Bomb,
  Gem,
} from "lucide-react";
import { toast } from "sonner";

type CellState = "hidden" | "revealed" | "mine" | "gem";

interface Cell {
  state: CellState;
  isMine: boolean;
}

export default function Mines() {
  const { user, recordWin, recordLoss, recordGame } = useUser();
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [revealedGems, setRevealedGems] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  const BOARD_SIZE = 5;
  const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateMultiplier = (gemsRevealed: number, mines: number) => {
    const safeSpots = TOTAL_CELLS - mines;
    if (gemsRevealed === 0) return 1;

    // Progressive multiplier calculation
    let multiplier = 1;
    for (let i = 1; i <= gemsRevealed; i++) {
      const probability = (safeSpots - i + 1) / (TOTAL_CELLS - i + 1);
      multiplier *= 1 / probability;
    }
    return Math.round(multiplier * 100) / 100;
  };

  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = [];

    // Create empty board
    for (let i = 0; i < BOARD_SIZE; i++) {
      newBoard[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        newBoard[i][j] = {
          state: "hidden",
          isMine: false,
        };
      }
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);

      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    setBoard(newBoard);
    setRevealedGems(0);
    setCurrentMultiplier(1);
    setGameOver(false);
  }, [mineCount]);

  const startGame = () => {
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    recordLoss(bet); // Take the bet amount upfront
    recordGame();
    setTotalGames((prev) => prev + 1);
    initializeBoard();
    setGameStarted(true);
  };

  const revealCell = (row: number, col: number) => {
    if (!gameStarted || gameOver || board[row][col].state !== "hidden") {
      return;
    }

    const newBoard = [...board];
    const cell = newBoard[row][col];

    if (cell.isMine) {
      // Hit a mine - game over
      cell.state = "mine";
      setBoard(newBoard);
      setGameOver(true);
      toast.error("💥 You hit a mine! Game over!");

      // Reveal all mines
      setTimeout(() => {
        const finalBoard = [...newBoard];
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (
              finalBoard[i][j].isMine &&
              finalBoard[i][j].state === "hidden"
            ) {
              finalBoard[i][j].state = "mine";
            }
          }
        }
        setBoard(finalBoard);
      }, 500);
    } else {
      // Found a gem
      cell.state = "gem";
      setBoard(newBoard);

      const newRevealedGems = revealedGems + 1;
      setRevealedGems(newRevealedGems);

      const newMultiplier = calculateMultiplier(newRevealedGems, mineCount);
      setCurrentMultiplier(newMultiplier);

      toast.success(`💎 Gem found! Multiplier: ${newMultiplier}x`);
    }
  };

  const cashOut = () => {
    if (!gameStarted || gameOver || revealedGems === 0) return;

    const winAmount = Math.floor(bet * currentMultiplier);
    recordWin(winAmount); // This adds to balance and totalWinnings

    setGameStarted(false);
    setGameOver(true);

    toast.success(`🎉 Cashed out! You won ${formatCurrency(winAmount)}!`, {
      description: `Multiplier: ${currentMultiplier}x`,
    });
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setBoard([]);
    setRevealedGems(0);
    setCurrentMultiplier(1);
    setTotalGames(0);
  };

  const maxBet = () => {
    setBet(Math.min(5000, user.balance));
  };

  const getCellContent = (cell: Cell) => {
    if (cell.state === "hidden") return "";
    if (cell.state === "mine")
      return <Bomb className="h-6 w-6 text-casino-red" />;
    if (cell.state === "gem")
      return <Gem className="h-6 w-6 text-casino-green" />;
    return "";
  };

  const getCellStyle = (cell: Cell) => {
    if (cell.state === "hidden") {
      return "bg-casino-black-light border-casino-gold/30 hover:bg-casino-black/50 cursor-pointer";
    }
    if (cell.state === "mine") {
      return "bg-casino-red/80 border-casino-red animate-pulse";
    }
    if (cell.state === "gem") {
      return "bg-casino-green/80 border-casino-green";
    }
    return "bg-casino-black-light border-casino-gold/30";
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
                <Spade className="h-6 w-6 text-white animate-pulse-casino" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">Mines</h1>
                <p className="text-sm text-casino-gold/70">
                  Find gems, avoid mines
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
                <CardContent className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="mines" className="text-white">
                      Number of Mines
                    </Label>
                    <Input
                      id="mines"
                      type="number"
                      min="1"
                      max="10"
                      value={mineCount}
                      onChange={(e) => setMineCount(Number(e.target.value))}
                      className="bg-casino-black-light border-casino-gold/30 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mines Game Board */}
            <Card className="bg-gradient-to-b from-casino-black to-casino-black-light border-2 border-casino-gold/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-casino-gold">
                  💎 Mines Game 💣
                </CardTitle>
                <CardDescription className="text-white/70">
                  {gameStarted
                    ? `Find gems and avoid ${mineCount} mines!`
                    : `Set your bet and start the game`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Current Game Stats */}
                {gameStarted && (
                  <div className="flex justify-center space-x-6 p-4 bg-casino-black-light rounded-lg">
                    <div className="text-center">
                      <p className="text-casino-gold font-semibold">
                        Gems Found
                      </p>
                      <p className="text-2xl text-casino-green">
                        {revealedGems}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-casino-gold font-semibold">
                        Multiplier
                      </p>
                      <p className="text-2xl text-casino-gold">
                        {currentMultiplier}x
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-casino-gold font-semibold">
                        Potential Win
                      </p>
                      <p className="text-2xl text-casino-green">
                        {formatCurrency(bet * currentMultiplier)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Game Board */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-5 gap-2 p-4 bg-casino-black-light rounded-lg">
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => revealCell(rowIndex, colIndex)}
                          disabled={
                            !gameStarted || gameOver || cell.state !== "hidden"
                          }
                          className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${getCellStyle(cell)}`}
                        >
                          {getCellContent(cell)}
                        </button>
                      )),
                    )}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="text-center space-y-4">
                  {!gameStarted ? (
                    <Button
                      onClick={startGame}
                      disabled={bet > user.balance || bet < 10}
                      className="w-full py-6 text-xl font-bold bg-gradient-to-r from-casino-red to-casino-red-dark hover:from-casino-red-dark hover:to-casino-red disabled:opacity-50"
                    >
                      💣 Start Game ({formatCurrency(bet)}) 💎
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      {!gameOver && revealedGems > 0 && (
                        <Button
                          onClick={cashOut}
                          className="w-full py-4 text-lg font-bold bg-gradient-to-r from-casino-green to-casino-green-dark hover:from-casino-green-dark hover:to-casino-green"
                        >
                          💰 Cash Out ({formatCurrency(bet * currentMultiplier)}
                          ) 💰
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

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setBet(Math.max(10, bet / 2))}
                      disabled={gameStarted}
                      className="flex-1 border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                    >
                      1/2
                    </Button>
                    <Button
                      variant="outline"
                      onClick={maxBet}
                      disabled={gameStarted}
                      className="flex-1 border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                    >
                      Max
                    </Button>
                  </div>
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
                  <span className="text-white/70">Mines:</span>
                  <span className="text-casino-red font-semibold">
                    {mineCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Safe Spots:</span>
                  <span className="text-casino-green font-semibold">
                    {TOTAL_CELLS - mineCount}
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
                  <span>Set your bet amount and number of mines</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">2.</span>
                  <span>Click cells to reveal gems 💎</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">3.</span>
                  <span>Avoid mines 💣 or lose your bet</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">4.</span>
                  <span>Cash out anytime to win multiplied amount</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">5.</span>
                  <span>More gems = higher multiplier!</span>
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
                <p>• More mines = higher risk, higher reward</p>
                <p>• Cash out early for guaranteed smaller wins</p>
                <p>• Each revealed gem increases your multiplier</p>
                <p>• Start with fewer mines to learn the game</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
