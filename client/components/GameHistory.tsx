import { useState } from "react";
import { GameHistory as GameHistoryType } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ChevronLeft, ChevronRight, Trophy, Target } from "lucide-react";

interface GameHistoryProps {
  gameHistory: GameHistoryType[];
}

export function GameHistory({ gameHistory }: GameHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  const totalPages = Math.ceil(gameHistory.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = gameHistory.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGameIcon = (game: string) => {
    switch (game.toLowerCase()) {
      case "coinflip":
        return "🪙";
      case "mines":
        return "💎";
      case "tower":
        return "🗼";
      case "blackjack":
        return "🃏";
      default:
        return "🎮";
    }
  };

  const totalWins = gameHistory.filter((g) => g.result === "win").length;
  const totalLosses = gameHistory.filter((g) => g.result === "loss").length;
  const totalWinnings = gameHistory
    .filter((g) => g.result === "win")
    .reduce((sum, g) => sum + g.winAmount, 0);
  const totalLosses_amount = gameHistory
    .filter((g) => g.result === "loss")
    .reduce((sum, g) => sum + g.bet, 0);

  if (gameHistory.length === 0) {
    return (
      <Card className="bg-casino-black/60 border-casino-gold/30">
        <CardHeader>
          <CardTitle className="text-casino-gold">Game History</CardTitle>
          <CardDescription className="text-white/70">
            Your recent gaming activity
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 text-casino-gold/50 mx-auto mb-4" />
          <p className="text-white/70">No games played yet!</p>
          <p className="text-sm text-white/50">
            Start playing to see your game history here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-casino-black/60 border-casino-gold/30">
      <CardHeader>
        <CardTitle className="text-casino-gold flex items-center justify-between">
          <span>Game History</span>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-casino-green" />
              <span className="text-casino-green">{totalWins}W</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-casino-red" />
              <span className="text-casino-red">{totalLosses}L</span>
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-white/70">
          Your recent gaming activity • Total: {gameHistory.length} games
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-casino-green/20 rounded-lg border border-casino-green/30">
            <p className="text-casino-green font-bold text-lg">
              {formatCurrency(totalWinnings)}
            </p>
            <p className="text-xs text-white/70">Total Won</p>
          </div>
          <div className="text-center p-3 bg-casino-red/20 rounded-lg border border-casino-red/30">
            <p className="text-casino-red font-bold text-lg">
              {formatCurrency(totalLosses_amount)}
            </p>
            <p className="text-xs text-white/70">Total Lost</p>
          </div>
          <div className="text-center p-3 bg-casino-gold/20 rounded-lg border border-casino-gold/30">
            <p className="text-casino-gold font-bold text-lg">
              {formatCurrency(totalWinnings - totalLosses_amount)}
            </p>
            <p className="text-xs text-white/70">Net Profit</p>
          </div>
          <div className="text-center p-3 bg-casino-purple/20 rounded-lg border border-casino-purple/30">
            <p className="text-casino-purple font-bold text-lg">
              {totalWins > 0
                ? Math.round((totalWins / gameHistory.length) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-white/70">Win Rate</p>
          </div>
        </div>

        {/* Games Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-casino-gold/20">
                <TableHead className="text-casino-gold">Game</TableHead>
                <TableHead className="text-casino-gold">Bet</TableHead>
                <TableHead className="text-casino-gold">Result</TableHead>
                <TableHead className="text-casino-gold">Amount</TableHead>
                <TableHead className="text-casino-gold">Multiplier</TableHead>
                <TableHead className="text-casino-gold">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentGames.map((game) => (
                <TableRow
                  key={game.id}
                  className="border-casino-gold/10 hover:bg-casino-black/30"
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getGameIcon(game.game)}</span>
                      <span className="text-white font-medium">
                        {game.game}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    {formatCurrency(game.bet)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        game.result === "win"
                          ? "bg-casino-green/20 text-casino-green"
                          : "bg-casino-red/20 text-casino-red"
                      }
                    >
                      {game.result === "win" ? "WIN" : "LOSS"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={
                      game.result === "win"
                        ? "text-casino-green font-semibold"
                        : "text-casino-red"
                    }
                  >
                    {game.result === "win"
                      ? `+${formatCurrency(game.winAmount)}`
                      : `-${formatCurrency(game.bet)}`}
                  </TableCell>
                  <TableCell className="text-white">
                    {game.multiplier ? `${game.multiplier}x` : "-"}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {formatDate(game.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-white/70">
              Showing {startIndex + 1}-{Math.min(endIndex, gameHistory.length)}{" "}
              of {gameHistory.length} games
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        page === currentPage
                          ? "bg-casino-gold text-casino-black"
                          : "border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                      }
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
