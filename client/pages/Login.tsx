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
import { Dice1, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);

    if (success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error("Invalid email or password");
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
          <p className="text-white/70">Welcome back! Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="bg-casino-black/60 border-casino-gold/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-casino-gold">Sign In</CardTitle>
            <CardDescription className="text-white/70">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-casino-black-light border-casino-gold/30 text-white placeholder:text-white/50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-casino-gold to-casino-gold-dark hover:from-casino-gold-dark hover:to-casino-gold text-casino-black font-bold py-3"
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-casino-gold hover:text-casino-gold-dark font-semibold"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-casino-purple/20 border-casino-purple/50">
          <CardHeader>
            <CardTitle className="text-casino-purple text-lg">
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="p-3 bg-casino-black/30 rounded-lg">
              <p className="text-casino-gold font-semibold mb-1">
                Admin Account:
              </p>
              <p className="text-white/80">Email: admin@wendercasino.com</p>
              <p className="text-white/80">Password: admin123</p>
            </div>
            <div className="p-3 bg-casino-black/30 rounded-lg">
              <p className="text-casino-green font-semibold mb-1">
                Regular Users:
              </p>
              <p className="text-white/80">
                Any email works for existing users (demo mode)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
