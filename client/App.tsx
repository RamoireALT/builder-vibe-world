import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import Coinflip from "./pages/Coinflip";
import Profile from "./pages/Profile";
import Mines from "./pages/Mines";
import Tower from "./pages/Tower";
import ComingSoon from "./pages/ComingSoon";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <UserProvider>
                    <Index />
                  </UserProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProvider>
                    <Profile />
                  </UserProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/coinflip"
              element={
                <ProtectedRoute>
                  <UserProvider>
                    <Coinflip />
                  </UserProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/mines"
              element={
                <ProtectedRoute>
                  <UserProvider>
                    <Mines />
                  </UserProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/tower"
              element={
                <ProtectedRoute>
                  <UserProvider>
                    <ComingSoon />
                  </UserProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/blackjack"
              element={
                <ProtectedRoute>
                  <UserProvider>
                    <ComingSoon />
                  </UserProvider>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
