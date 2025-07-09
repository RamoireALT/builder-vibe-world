import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dice1, Mail, Lock, User, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    const result = await register(
      username,
      email,
      password,
      promoCode || undefined,
    );

    if (result.success) {
      toast.success(result.message);
      navigate("/");
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casino-black via-casino-black-light to-casino-gold-dark flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-casino-gold to-casino-gold-dark p-3 rounded-lg">
              <Dice1 className="h-8 w-8 text-casino-black animate-pulse-casino" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-casino-gold to-casino-gold-dark bg-clip-text text-transparent">
              WENDER Casino
            </h1>
          </div>
          <p className="text-white/70">
            Create your account and start playing with $10,000!
          </p>
        </div>

        {/* Register Form */}
        <Card className="bg-casino-black/60 border-casino-gold/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-casino-gold">
              Create Account
            </CardTitle>
            <CardDescription className="text-white/70">
              Join WENDER Casino and start your gaming adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-casino-gold/50" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-casino-black-light border-casino-gold/30 text-white placeholder:text-white/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-casino-gold/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-casino-black-light border-casino-gold/30 text-white placeholder:text-white/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-casino-gold/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-casino-black-light border-casino-gold/30 text-white placeholder:text-white/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-casino-gold/50" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-casino-black-light border-casino-gold/30 text-white placeholder:text-white/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoCode" className="text-white">
                  Promo Code (Optional)
                </Label>
                <Input
                  id="promoCode"
                  type="text"
                  placeholder="Enter promo code for bonus"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-casino-black-light border-casino-gold/30 text-white placeholder:text-white/50"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black font-bold py-3"
              >
                {isLoading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-casino-gold hover:text-casino-gold-dark font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mt-6 bg-casino-green/20 border-casino-green/50">
          <CardHeader>
            <CardTitle className="text-casino-green text-lg">
              🎁 Welcome Bonus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-white/80">
              • Get bonus balance with promo codes
            </p>
            <p className="text-white/80">• Access to all casino games</p>
            <p className="text-white/80">
              • Track your progress and achievements
            </p>
            <p className="text-white/80">• Compete with friends</p>
            <div className="mt-3 p-2 bg-casino-gold/10 rounded border border-casino-gold/30">
              <p className="text-casino-gold font-semibold text-xs">
                💡 Try promo code "Release" for $100 bonus!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
