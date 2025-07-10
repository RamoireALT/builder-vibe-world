import { useState, useCallback, useEffect } from "react";
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
  Heart,
  Volume2,
  VolumeX,
  RotateCcw,
  Spade,
  Diamond,
  Club,
} from "lucide-react";
import { toast } from "sonner";

interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string;
  value: number;
}

interface Hand {
  cards: Card[];
  value: number;
  isBlackjack: boolean;
  isBust: boolean;
}

type GameState = "betting" | "playing" | "dealer" | "finished";

export default function BlackJack() {
  const { user, recordWin, recordLoss, recordGame } = useUser();
  const [bet, setBet] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<GameState>("betting");
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Hand>({
    cards: [],
    value: 0,
    isBlackjack: false,
    isBust: false,
  });
  const [dealerHand, setDealerHand] = useState<Hand>({
    cards: [],
    value: 0,
    isBlackjack: false,
    isBust: false,
  });
  const [totalGames, setTotalGames] = useState(0);
  const [gameResult, setGameResult] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const createDeck = (): Card[] => {
    const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];
    const deck: Card[] = [];

    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        let value = parseInt(rank);
        if (rank === "A") value = 11;
        else if (["J", "Q", "K"].includes(rank)) value = 10;

        deck.push({ suit, rank, value });
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  };

  const calculateHandValue = (cards: Card[]): number => {
    let value = 0;
    let aces = 0;

    cards.forEach((card) => {
      if (card.rank === "A") {
        aces++;
        value += 11;
      } else {
        value += card.value;
      }
    });

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  const updateHand = (cards: Card[]): Hand => {
    const value = calculateHandValue(cards);
    const isBlackjack = cards.length === 2 && value === 21;
    const isBust = value > 21;

    return { cards, value, isBlackjack, isBust };
  };

  const dealCard = (currentDeck: Card[]): { card: Card; newDeck: Card[] } => {
    const card = currentDeck[0];
    const newDeck = currentDeck.slice(1);
    return { card, newDeck };
  };

  const startGame = () => {
    if (bet > user.balance) {
      toast.error("Insufficient balance!");
      return;
    }

    recordLoss(bet, "BlackJack");
    recordGame();
    setTotalGames((prev) => prev + 1);

    // Create and shuffle deck
    let currentDeck = createDeck();
    const playerCards: Card[] = [];
    const dealerCards: Card[] = [];

    // Deal initial cards
    for (let i = 0; i < 2; i++) {
      const { card: playerCard, newDeck: deck1 } = dealCard(currentDeck);
      playerCards.push(playerCard);
      currentDeck = deck1;

      const { card: dealerCard, newDeck: deck2 } = dealCard(currentDeck);
      dealerCards.push(dealerCard);
      currentDeck = deck2;
    }

    setDeck(currentDeck);
    setPlayerHand(updateHand(playerCards));
    setDealerHand(updateHand(dealerCards));
    setGameState("playing");
    setGameResult("");

    // Check for immediate blackjacks
    const playerBlackjack =
      playerCards.length === 2 && calculateHandValue(playerCards) === 21;
    const dealerBlackjack =
      dealerCards.length === 2 && calculateHandValue(dealerCards) === 21;

    if (playerBlackjack || dealerBlackjack) {
      setTimeout(
        () => finishGame(updateHand(playerCards), updateHand(dealerCards)),
        1000,
      );
    }
  };

  const hit = () => {
    if (gameState !== "playing") return;

    const { card, newDeck } = dealCard(deck);
    const newPlayerCards = [...playerHand.cards, card];
    const newPlayerHand = updateHand(newPlayerCards);

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);

    if (newPlayerHand.isBust) {
      setTimeout(() => finishGame(newPlayerHand, dealerHand), 1000);
    }
  };

  const stand = () => {
    if (gameState !== "playing") return;

    setGameState("dealer");
    playDealerHand();
  };

  const playDealerHand = () => {
    let currentDealerHand = dealerHand;
    let currentDeck = deck;

    const dealerPlay = () => {
      if (currentDealerHand.value < 17) {
        const { card, newDeck } = dealCard(currentDeck);
        const newDealerCards = [...currentDealerHand.cards, card];
        currentDealerHand = updateHand(newDealerCards);
        currentDeck = newDeck;

        setDealerHand(currentDealerHand);
        setDeck(currentDeck);

        setTimeout(dealerPlay, 1000);
      } else {
        finishGame(playerHand, currentDealerHand);
      }
    };

    setTimeout(dealerPlay, 1000);
  };

  const finishGame = (finalPlayerHand: Hand, finalDealerHand: Hand) => {
    setGameState("finished");

    let result = "";
    let winAmount = 0;

    if (finalPlayerHand.isBust) {
      result = "Player Bust - Dealer Wins";
    } else if (finalDealerHand.isBust) {
      result = "Dealer Bust - You Win!";
      winAmount = finalPlayerHand.isBlackjack ? bet * 2.5 : bet * 2;
    } else if (finalPlayerHand.isBlackjack && !finalDealerHand.isBlackjack) {
      result = "Blackjack! You Win!";
      winAmount = bet * 2.5;
    } else if (finalDealerHand.isBlackjack && !finalPlayerHand.isBlackjack) {
      result = "Dealer Blackjack - Dealer Wins";
    } else if (finalPlayerHand.value > finalDealerHand.value) {
      result = "You Win!";
      winAmount = bet * 2;
    } else if (finalPlayerHand.value < finalDealerHand.value) {
      result = "Dealer Wins";
    } else {
      result = "Push (Tie)";
      winAmount = bet; // Return bet on tie
    }

    setGameResult(result);

    if (winAmount > 0) {
      if (winAmount > bet) {
        // Player won - give them the total winnings (which includes their bet back)
        const netProfit = winAmount - bet; // Just the profit portion
        recordWin(winAmount, "BlackJack", bet, winAmount / bet);
        toast.success(`🎉 ${result} Won ${formatCurrency(winAmount)}!`);
      } else {
        // Push/Tie - just return the bet
        recordWin(bet, "BlackJack", bet, 1);
        toast.success(`🤝 ${result} Bet returned!`);
      }
    } else {
      toast.error(`😔 ${result}`);
    }
  };

  const resetGame = () => {
    setGameState("betting");
    setPlayerHand({ cards: [], value: 0, isBlackjack: false, isBust: false });
    setDealerHand({ cards: [], value: 0, isBlackjack: false, isBust: false });
    setDeck([]);
    setGameResult("");
    setTotalGames(0);
  };

  const maxBet = () => {
    setBet(Math.min(5000, user.balance));
  };

  const getSuitIcon = (suit: Card["suit"]) => {
    switch (suit) {
      case "hearts":
        return <Heart className="h-4 w-4 text-casino-red" />;
      case "diamonds":
        return <Diamond className="h-4 w-4 text-casino-red" />;
      case "clubs":
        return <Club className="h-4 w-4 text-white" />;
      case "spades":
        return <Spade className="h-4 w-4 text-white" />;
    }
  };

  const renderCard = (card: Card, hidden = false) => (
    <div
      className={`w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center text-sm font-bold ${
        hidden
          ? "bg-casino-purple border-casino-purple-dark"
          : "bg-white border-gray-300 text-black"
      }`}
    >
      {hidden ? (
        <div className="text-white">🂠</div>
      ) : (
        <>
          <div
            className={
              card.suit === "hearts" || card.suit === "diamonds"
                ? "text-red-600"
                : "text-black"
            }
          >
            {card.rank}
          </div>
          {getSuitIcon(card.suit)}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-black via-casino-black-light to-casino-purple-dark">
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
              <div className="bg-gradient-to-r from-casino-purple to-casino-purple-dark p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white animate-pulse-casino" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">
                  BlackJack
                </h1>
                <p className="text-sm text-casino-gold/70">Beat the dealer!</p>
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
            {gameState === "betting" && (
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
                        min="25"
                        max={Math.min(2500, user.balance)}
                        step="25"
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
                          onClick={() => setBet(Math.max(25, bet / 2))}
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

            {/* BlackJack Game */}
            <Card className="bg-gradient-to-b from-casino-black to-casino-black-light border-2 border-casino-gold/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-casino-gold">
                  🃏 BlackJack 🃏
                </CardTitle>
                <CardDescription className="text-white/70">
                  {gameState === "betting"
                    ? "Place your bet and deal the cards!"
                    : gameState === "playing"
                      ? "Hit or Stand to beat the dealer!"
                      : gameState === "dealer"
                        ? "Dealer is playing..."
                        : gameResult}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Game Result */}
                {gameResult && (
                  <div
                    className={`text-center p-4 rounded-lg border ${
                      gameResult.includes("Win")
                        ? "bg-casino-green/20 border-casino-green/50"
                        : gameResult.includes("Push")
                          ? "bg-casino-gold/20 border-casino-gold/50"
                          : "bg-casino-red/20 border-casino-red/50"
                    }`}
                  >
                    <p
                      className={`font-bold text-xl ${
                        gameResult.includes("Win")
                          ? "text-casino-green"
                          : gameResult.includes("Push")
                            ? "text-casino-gold"
                            : "text-casino-red"
                      }`}
                    >
                      {gameResult}
                    </p>
                  </div>
                )}

                {/* Dealer Hand */}
                {gameState !== "betting" && (
                  <div className="text-center">
                    <h3 className="text-casino-gold font-semibold mb-3">
                      Dealer
                      {gameState !== "playing" && (
                        <span className="ml-2 text-white">
                          ({dealerHand.value})
                        </span>
                      )}
                    </h3>
                    <div className="flex justify-center space-x-2 mb-4">
                      {dealerHand.cards.map((card, index) => (
                        <div key={index}>
                          {renderCard(
                            card,
                            gameState === "playing" && index === 1,
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Player Hand */}
                {gameState !== "betting" && (
                  <div className="text-center">
                    <h3 className="text-casino-gold font-semibold mb-3">
                      Your Hand ({playerHand.value})
                      {playerHand.isBlackjack && (
                        <Badge className="ml-2 bg-casino-gold text-casino-black">
                          BLACKJACK!
                        </Badge>
                      )}
                      {playerHand.isBust && (
                        <Badge className="ml-2 bg-casino-red text-white">
                          BUST!
                        </Badge>
                      )}
                    </h3>
                    <div className="flex justify-center space-x-2 mb-4">
                      {playerHand.cards.map((card, index) => (
                        <div key={index}>{renderCard(card)}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Game Controls */}
                <div className="text-center space-y-4">
                  {gameState === "betting" ? (
                    <Button
                      onClick={startGame}
                      disabled={bet > user.balance || bet < 25}
                      className="w-full py-6 text-xl font-bold bg-gradient-to-r from-casino-purple to-casino-purple-dark hover:from-casino-purple-dark hover:to-casino-purple disabled:opacity-50"
                    >
                      🃏 Deal Cards ({formatCurrency(bet)}) 🃏
                    </Button>
                  ) : gameState === "playing" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={hit}
                        disabled={playerHand.isBust || playerHand.isBlackjack}
                        className="py-4 text-lg font-bold bg-gradient-to-r from-casino-red to-casino-red-dark hover:from-casino-red-dark hover:to-casino-red"
                      >
                        🃏 Hit
                      </Button>
                      <Button
                        onClick={stand}
                        disabled={playerHand.isBust || playerHand.isBlackjack}
                        className="py-4 text-lg font-bold bg-gradient-to-r from-casino-green to-casino-green-dark hover:from-casino-green-dark hover:to-casino-green"
                      >
                        ✋ Stand
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={resetGame}
                      className="w-full border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      New Game
                    </Button>
                  )}

                  {gameState === "playing" && (
                    <p className="text-casino-gold/70 text-sm">
                      Goal: Get as close to 21 without going over
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
                {gameState !== "betting" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/70">Your Hand:</span>
                      <span className="text-casino-green font-semibold">
                        {playerHand.value}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Dealer Hand:</span>
                      <span className="text-casino-red font-semibold">
                        {gameState === "playing" ? "?" : dealerHand.value}
                      </span>
                    </div>
                  </>
                )}
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
                  <span>Set your bet and deal the cards</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">2.</span>
                  <span>Goal: Get as close to 21 without going over</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">3.</span>
                  <span>Hit to draw more cards, Stand to stop</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">4.</span>
                  <span>Dealer must hit on 16 and stand on 17</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-casino-gold">5.</span>
                  <span>Blackjack (21 with 2 cards) pays 2.5x</span>
                </div>
              </CardContent>
            </Card>

            {/* Card Values */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">Card Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>Number cards (2-10):</span>
                  <span>Face value</span>
                </div>
                <div className="flex justify-between">
                  <span>Face cards (J, Q, K):</span>
                  <span>10 points</span>
                </div>
                <div className="flex justify-between">
                  <span>Ace:</span>
                  <span>1 or 11 points</span>
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
                <p>• Always stand on 17 or higher</p>
                <p>• Consider dealer's up card when deciding</p>
                <p>• Hit on soft 17 (Ace + 6)</p>
                <p>• Never go over 21 (bust)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
