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
import { ArrowLeft, Dice1, Clock, Wrench } from "lucide-react";

export default function ComingSoon() {
  const { user } = useUser();

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
                <Dice1 className="h-6 w-6 text-white animate-pulse-casino" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">
                  Coming Soon
                </h1>
                <p className="text-sm text-casino-gold/70">Under Development</p>
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-casino-black/60 border-casino-gold/30 backdrop-blur-sm">
            <CardHeader className="text-center py-12">
              <div className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-r from-casino-purple to-casino-purple-dark">
                <Wrench className="h-16 w-16 text-white animate-pulse-casino" />
              </div>
              <CardTitle className="text-4xl text-casino-gold mb-4">
                🚧 Under Construction 🚧
              </CardTitle>
              <CardDescription className="text-xl text-white/80">
                This exciting casino game is coming soon!
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-12 space-y-6">
              <div className="flex items-center justify-center space-x-4 text-casino-gold/70">
                <Clock className="h-6 w-6" />
                <span className="text-lg">
                  Our developers are working hard to bring you more games
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-casino-black-light/50 rounded-lg border border-casino-gold/20">
                  <h3 className="font-bold text-casino-gold mb-2">Blackjack</h3>
                  <p className="text-sm text-white/70">Classic 21 card game</p>
                </div>
                <div className="p-4 bg-casino-black-light/50 rounded-lg border border-casino-gold/20">
                  <h3 className="font-bold text-casino-gold mb-2">Poker</h3>
                  <p className="text-sm text-white/70">Texas Hold'em style</p>
                </div>
                <div className="p-4 bg-casino-black-light/50 rounded-lg border border-casino-gold/20">
                  <h3 className="font-bold text-casino-gold mb-2">Roulette</h3>
                  <p className="text-sm text-white/70">European wheel style</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link to="/">
                  <Button className="bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black font-bold">
                    Return to Lobby
                  </Button>
                </Link>
                <Link to="/games/slots">
                  <Button
                    variant="outline"
                    className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
                  >
                    Play Slot Machine
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-casino-purple/20 rounded-lg border border-casino-purple/50">
            <h3 className="text-casino-purple font-bold mb-2">
              💡 Want to help develop?
            </h3>
            <p className="text-white/80 text-sm">
              This is an educational project! You can expand it by adding more
              games, improving the UI, or adding multiplayer features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
