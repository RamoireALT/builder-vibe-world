import { createContext, useContext, ReactNode } from "react";
import { useAuth, User } from "./AuthContext";

interface UserContextType {
  user: User;
  updateBalance: (amount: number) => void;
  recordWin: (amount: number) => void;
  recordLoss: (amount: number) => void;
  recordGame: () => void;
  resetBalance: () => void;
  updateUsername: (username: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, updateUserStats, addGameToHistory } = useAuth();

  if (!user) {
    // This should be handled by the auth guard
    throw new Error("UserProvider requires authenticated user");
  }

  const updateBalance = (amount: number) => {
    updateUserStats(user.id, {
      balance: Math.max(0, user.balance + amount),
    });
  };

  const recordWin = (amount: number) => {
    updateUserStats(user.id, {
      balance: user.balance + amount,
      totalWinnings: user.totalWinnings + amount,
    });
  };

  const recordLoss = (amount: number) => {
    updateUserStats(user.id, {
      balance: Math.max(0, user.balance - amount),
      totalLosses: user.totalLosses + amount,
    });
  };

  const recordGame = () => {
    updateUserStats(user.id, {
      gamesPlayed: user.gamesPlayed + 1,
    });
  };

  const resetBalance = () => {
    updateUserStats(user.id, {
      balance: 10000,
    });
  };

  const updateUsername = (username: string) => {
    updateUserStats(user.id, {
      username: username.trim(),
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateBalance,
        recordWin,
        recordLoss,
        recordGame,
        resetBalance,
        updateUsername,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
