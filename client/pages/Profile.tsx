import { useState } from "react";
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
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  User,
  Coins,
  TrendingUp,
  TrendingDown,
  Trophy,
  RotateCcw,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, resetBalance, updateBalance, updateUsername } = useUser();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [customBalance, setCustomBalance] = useState(10000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleUsernameChange = () => {
    if (newUsername.trim() && newUsername !== user.username) {
      updateUsername(newUsername);
      setIsEditingUsername(false);
      toast.success(`Username updated to ${newUsername}!`);
    } else {
      setNewUsername(user.username);
      setIsEditingUsername(false);
    }
  };

  const handleBalanceReset = () => {
    resetBalance();
    setShowResetDialog(false);
    toast.success("Balance reset to $10,000!");
  };

  const handleCustomBalance = () => {
    updateBalance(customBalance - user.balance);
    toast.success(`Balance set to ${formatCurrency(customBalance)}!`);
  };

  const calculateWinRate = () => {
    if (user.gamesPlayed === 0) return 0;
    // Estimate win rate based on current balance vs expected if all losses
    const estimatedWins = Math.max(
      0,
      user.gamesPlayed - Math.floor(user.totalLosses / 100),
    );
    return Math.round((estimatedWins / user.gamesPlayed) * 100);
  };

  const getAchievements = () => {
    const achievements = [];
    if (user.gamesPlayed >= 10) achievements.push("Beginner");
    if (user.gamesPlayed >= 50) achievements.push("Regular Player");
    if (user.gamesPlayed >= 100) achievements.push("High Roller");
    if (user.totalWinnings >= 5000) achievements.push("Big Winner");
    if (user.totalWinnings >= 20000) achievements.push("Millionaire");
    if (user.balance >= 50000) achievements.push("Wealthy");
    return achievements;
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
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">Profile</h1>
                <p className="text-sm text-casino-gold/70">Player Settings</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-casino-gold/70">Current Balance</p>
            <p className="text-lg font-bold text-casino-gold">
              {formatCurrency(user.balance)}
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info Card */}
            <Card className="bg-casino-black/60 border-casino-gold/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-casino-gold flex items-center justify-between">
                  <span>Player Information</span>
                  <Badge
                    variant="secondary"
                    className="bg-casino-gold/20 text-casino-gold"
                  >
                    ID: {user.id}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-casino-gold to-casino-gold-dark rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-casino-black" />
                  </div>
                  <div className="flex-1">
                    {isEditingUsername ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="bg-casino-black-light border-casino-gold/30 text-white"
                          placeholder="Enter username"
                        />
                        <Button
                          size="sm"
                          onClick={handleUsernameChange}
                          className="bg-casino-green hover:bg-casino-green-dark"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingUsername(false);
                            setNewUsername(user.username);
                          }}
                          className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-bold text-white">
                          {user.username}
                        </h2>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingUsername(true)}
                          className="border-casino-gold/50 text-casino-gold hover:bg-casino-gold/20"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-casino-gold/70">
                      Member since today • {user.gamesPlayed} games played
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card className="bg-casino-black/60 border-casino-gold/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-casino-gold">
                  Gaming Statistics
                </CardTitle>
                <CardDescription className="text-white/70">
                  Your performance across all games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-casino-gold/20 rounded-lg mx-auto mb-2">
                      <Coins className="h-6 w-6 text-casino-gold" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(user.balance)}
                    </p>
                    <p className="text-sm text-white/70">Current Balance</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-casino-green/20 rounded-lg mx-auto mb-2">
                      <TrendingUp className="h-6 w-6 text-casino-green" />
                    </div>
                    <p className="text-2xl font-bold text-casino-green">
                      {formatCurrency(user.totalWinnings)}
                    </p>
                    <p className="text-sm text-white/70">Total Winnings</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-casino-red/20 rounded-lg mx-auto mb-2">
                      <TrendingDown className="h-6 w-6 text-casino-red" />
                    </div>
                    <p className="text-2xl font-bold text-casino-red">
                      {formatCurrency(user.totalLosses)}
                    </p>
                    <p className="text-sm text-white/70">Total Losses</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-casino-purple/20 rounded-lg mx-auto mb-2">
                      <Trophy className="h-6 w-6 text-casino-purple" />
                    </div>
                    <p className="text-2xl font-bold text-casino-purple">
                      {calculateWinRate()}%
                    </p>
                    <p className="text-sm text-white/70">Est. Win Rate</p>
                  </div>
                </div>

                <Separator className="my-6 bg-casino-gold/20" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Games Played:</span>
                    <span className="text-white font-semibold">
                      {user.gamesPlayed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Net Profit:</span>
                    <span
                      className={`font-semibold ${
                        user.totalWinnings - user.totalLosses >= 0
                          ? "text-casino-green"
                          : "text-casino-red"
                      }`}
                    >
                      {formatCurrency(user.totalWinnings - user.totalLosses)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Achievements:</span>
                    <span className="text-casino-gold font-semibold">
                      {getAchievements().length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Code Usage */}
            <Card className="bg-casino-black/60 border-casino-gold/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-casino-gold">
                  Referral Code
                </CardTitle>
                <CardDescription className="text-white/70">
                  Use a referral code to get bonus balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.usedReferralCode ? (
                  <div className="p-4 bg-casino-green/20 rounded-lg border border-casino-green/50">
                    <p className="text-casino-green font-semibold">
                      ✅ You used referral code: {user.usedReferralCode}
                    </p>
                    <p className="text-sm text-white/70">
                      You can only use one referral code per account
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-white">
                      Enter Referral Code
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="bg-casino-black-light border-casino-gold/30 text-white"
                      />
                      <Button
                        onClick={handleUseReferralCode}
                        disabled={!referralCode.trim()}
                        className="bg-casino-gold hover:bg-casino-gold-dark text-casino-black"
                      >
                        Use Code
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">Achievements</CardTitle>
                <CardDescription className="text-white/70">
                  Your gaming milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getAchievements().map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 bg-casino-gold/10 rounded-lg"
                    >
                      <Trophy className="h-5 w-5 text-casino-gold" />
                      <span className="text-white font-semibold">
                        {achievement}
                      </span>
                    </div>
                  ))}
                  {getAchievements().length === 0 && (
                    <p className="text-white/50 text-center py-4">
                      Play games to earn achievements!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-casino-black/60 border-casino-gold/30">
              <CardHeader>
                <CardTitle className="text-casino-gold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Favorite Game:</span>
                  <span className="text-white">Coinflip</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Biggest Win:</span>
                  <span className="text-casino-green">
                    {formatCurrency(Math.max(user.totalWinnings / 10, 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Longest Streak:</span>
                  <span className="text-casino-gold">5 wins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Risk Level:</span>
                  <Badge
                    variant="secondary"
                    className="bg-casino-green/20 text-casino-green"
                  >
                    Conservative
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Game Links */}
            <Card className="bg-casino-purple/20 border-casino-purple/50">
              <CardHeader>
                <CardTitle className="text-casino-purple">Quick Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/games/coinflip" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-casino-gold text-casino-gold hover:bg-casino-gold hover:text-casino-black"
                  >
                    🪙 Play Coinflip
                  </Button>
                </Link>
                <Link to="/" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-casino-purple text-casino-purple hover:bg-casino-purple hover:text-white"
                  >
                    🏠 Back to Lobby
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
