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
import {
  Dice1,
  Spade,
  Heart,
  Diamond,
  Club,
  TrendingUp,
  Trophy,
  Coins,
} from "lucide-react";

export default function Index() {
  const { user } = useUser();

  const games = [
    {
      id: "slots",
      name: "Slot Machine",
      description: "Classic 3-reel slot machine with exciting bonus rounds",
      minBet: 10,
      maxBet: 1000,
      icon: <Spade className="h-8 w-8" />,
      color: "casino-red",
      available: true,
    },
    {
      id: "blackjack",
      name: "Blackjack",
      description: "Beat the dealer in this classic card game",
      minBet: 25,
      maxBet: 2500,
      icon: <Heart className="h-8 w-8" />,
      color: "casino-black",
      available: false,
    },
    {
      id: "poker",
      name: "Texas Hold'em",
      description: "Five-card poker with exciting side bets",
      minBet: 50,
      maxBet: 5000,
      icon: <Diamond className="h-8 w-8" />,
      color: "casino-purple",
      available: false,
    },
    {
      id: "roulette",
      name: "European Roulette",
      description: "Spin the wheel and place your bets",
      minBet: 5,
      maxBet: 1000,
      icon: <Club className="h-8 w-8" />,
      color: "casino-green",
      available: false,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-black via-casino-black-light to-casino-purple-dark">
      {/* Header */}
      <header className="border-b border-casino-gold/20 bg-casino-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-casino-gold to-casino-gold-dark p-2 rounded-lg">
              <Dice1 className="h-8 w-8 text-casino-black animate-pulse-casino" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-casino-gold to-casino-gold-dark bg-clip-text text-transparent">
                Royal Casino
              </h1>
              <p className="text-sm text-casino-gold/70">
                Educational Gaming Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-casino-gold/70">
                Welcome, {user.username}
              </p>
              <p className="text-lg font-bold text-casino-gold">
                {formatCurrency(user.balance)}
              </p>
            </div>
            <Button
              variant="outline"
              className="border-casino-gold text-casino-gold hover:bg-casino-gold hover:text-casino-black"
            >
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-casino-gold via-casino-gold-dark to-casino-red bg-clip-text text-transparent">
            Welcome to Royal Casino
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the thrill of casino gaming with virtual currency. Play
            responsibly and have fun with your friends!
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="bg-casino-black/50 border-casino-gold/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-casino-green mx-auto mb-2" />
                <p className="text-2xl font-bold text-casino-green">
                  {formatCurrency(user.totalWinnings)}
                </p>
                <p className="text-sm text-white/70">Total Winnings</p>
              </CardContent>
            </Card>

            <Card className="bg-casino-black/50 border-casino-gold/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-casino-gold mx-auto mb-2" />
                <p className="text-2xl font-bold text-casino-gold">
                  {user.gamesPlayed}
                </p>
                <p className="text-sm text-white/70">Games Played</p>
              </CardContent>
            </Card>

            <Card className="bg-casino-black/50 border-casino-gold/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Coins className="h-8 w-8 text-casino-purple mx-auto mb-2" />
                <p className="text-2xl font-bold text-casino-purple">
                  {formatCurrency(user.balance)}
                </p>
                <p className="text-sm text-white/70">Current Balance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">
            Choose Your Game
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className={`relative overflow-hidden bg-casino-black/60 border-casino-gold/30 backdrop-blur-sm hover:border-casino-gold/60 transition-all duration-300 group ${
                  game.available
                    ? "hover:scale-105 cursor-pointer"
                    : "opacity-60"
                }`}
              >
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto p-4 rounded-full bg-gradient-to-r from-${game.color} to-${game.color}-dark mb-4 group-hover:animate-glow`}
                  >
                    <div className="text-white">{game.icon}</div>
                  </div>
                  <CardTitle className="text-white text-xl">
                    {game.name}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {game.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="flex justify-between text-sm text-white/80 mb-4">
                    <span>Min: {formatCurrency(game.minBet)}</span>
                    <span>Max: {formatCurrency(game.maxBet)}</span>
                  </div>

                  {game.available ? (
                    <Link to={`/games/${game.id}`}>
                      <Button className="w-full bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black font-bold">
                        Play Now
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Badge
                        variant="secondary"
                        className="bg-casino-red/20 text-casino-red"
                      >
                        Coming Soon
                      </Badge>
                      <Button disabled className="w-full">
                        Not Available
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-casino-black/80 border-t border-casino-gold/20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/70 mb-2">
            🎰 Royal Casino - Educational Gaming Platform
          </p>
          <p className="text-sm text-white/50">
            This is a virtual casino for educational purposes only. No real
            money is involved.
          </p>
        </div>
      </footer>
    </div>
  );
}
