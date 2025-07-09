import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: string;
  username: string;
  balance: number;
  totalWinnings: number;
  totalLosses: number;
  gamesPlayed: number;
  achievements: string[];
}

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

const INITIAL_USER: User = {
  id: "1",
  username: "Player",
  balance: 10000, // Starting with $10,000 virtual currency
  totalWinnings: 0,
  totalLosses: 0,
  gamesPlayed: 0,
  achievements: [],
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem("casino-user");
    return savedUser ? JSON.parse(savedUser) : INITIAL_USER;
  });

  useEffect(() => {
    localStorage.setItem("casino-user", JSON.stringify(user));
  }, [user]);

  const updateBalance = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance + amount),
    }));
  };

  const recordWin = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      totalWinnings: prev.totalWinnings + amount,
    }));
  };

  const recordLoss = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
      totalLosses: prev.totalLosses + amount,
    }));
  };

  const recordGame = () => {
    setUser((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  };

  const resetBalance = () => {
    setUser((prev) => ({
      ...prev,
      balance: INITIAL_USER.balance,
    }));
  };

  const updateUsername = (username: string) => {
    setUser((prev) => ({
      ...prev,
      username: username.trim(),
    }));
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
