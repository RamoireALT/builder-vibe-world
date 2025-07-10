import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface GameHistory {
  id: string;
  game: string;
  bet: number;
  result: "win" | "loss";
  winAmount: number;
  multiplier?: number;
  timestamp: string;
}

export interface PromoCode {
  id: string;
  code: string;
  createdBy: string;
  balance: number;
  usedBy?: string;
  usedAt?: string;
  isActive: boolean;
  isOneTimeUse: boolean;
  createdAt: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  ownerId: string;
  ownerUsername: string;
  totalEarnings: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  totalWinnings: number;
  totalLosses: number;
  gamesPlayed: number;
  achievements: string[];
  gameHistory: GameHistory[];
  winStreak: number;
  maxWinStreak: number;
  lossStreak: number;
  maxLossStreak: number;
  referralCode?: string;
  usedReferralCode?: string;
  usedPromoCode?: string;
  referralEarnings: number;
  depositBonus: number; // 5% bonus from referral
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  referralCodes: ReferralCode[];
  promoCodes: PromoCode[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    promoCode?: string,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserStats: (userId: string, updates: Partial<User>) => void;
  addGameToHistory: (
    userId: string,
    gameData: Omit<GameHistory, "id" | "timestamp">,
  ) => void;
  createPromoCode: (code: string, balance: number) => boolean;
  createReferralCode: (ownerId: string) => string;
  usePromoCode: (
    userId: string,
    code: string,
  ) => { success: boolean; message: string };
  useReferralCode: (
    userId: string,
    code: string,
  ) => { success: boolean; message: string };
  processReferralWin: (userId: string, winAmount: number) => void;
  checkAchievements: (userId: string) => void;
  deleteUser: (userId: string) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@wendercasino.com";
const ADMIN_PASSWORD = "admin123";

const INITIAL_USER_DATA = {
  balance: 0, // Users start with $0 now
  totalWinnings: 0,
  totalLosses: 0,
  gamesPlayed: 0,
  achievements: [],
  gameHistory: [],
  winStreak: 0,
  maxWinStreak: 0,
  lossStreak: 0,
  maxLossStreak: 0,
  referralEarnings: 0,
  depositBonus: 0,
};

const ACHIEVEMENTS = {
  "First Win": "Win your first game",
  "Its Getting Somewhere": "Win 10 games",
  "Hot Potato": "Win 5 games in a row without losing",
  Inferno: "Win 20 games in a row without losing",
  "Big Win": "Earn total $100",
  Massive: "Earn total $2,000",
  "True Gamer": "Play 100 games total",
  Influence: "Get your own referral code by devs",
  Admin: "Only on admin accounts",
  "Its Over 9000": "Get balance of $9,000 at least 1 time",
  "THESE GAMES ARE RIGGED!": "Lose 10 games in a row",
  "More Coming Later": "Secret achievement",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  useEffect(() => {
    // Load users from localStorage
    const savedUsers = localStorage.getItem("casino-users");
    const parsedUsers = savedUsers ? JSON.parse(savedUsers) : [];
    setUsers(parsedUsers);

    // Load referral codes from localStorage
    const savedReferralCodes = localStorage.getItem("casino-referral-codes");
    const parsedReferralCodes = savedReferralCodes
      ? JSON.parse(savedReferralCodes)
      : [];
    setReferralCodes(parsedReferralCodes);

    // Check if user is logged in
    const savedCurrentUser = localStorage.getItem("casino-current-user");
    if (savedCurrentUser) {
      const currentUser = JSON.parse(savedCurrentUser);
      setUser(currentUser);
    }

    // Create admin user if it doesn't exist
    if (!parsedUsers.find((u: User) => u.email === ADMIN_EMAIL)) {
      const adminUser: User = {
        id: "admin",
        username: "Admin",
        email: ADMIN_EMAIL,
        ...INITIAL_USER_DATA,
        balance: 1000000, // Admin starts with more money
        achievements: ["Admin"], // Admin achievement
        isAdmin: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      const updatedUsers = [...parsedUsers, adminUser];
      setUsers(updatedUsers);
      localStorage.setItem("casino-users", JSON.stringify(updatedUsers));
    }

    // Create default "Release" promo code if it doesn't exist
    if (!parsedReferralCodes.find((r: ReferralCode) => r.code === "Release")) {
      const releaseCode: ReferralCode = {
        id: "release-promo",
        code: "Release",
        createdBy: "admin",
        balance: 100,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const updatedCodes = [...parsedReferralCodes, releaseCode];
      setReferralCodes(updatedCodes);
      localStorage.setItem(
        "casino-referral-codes",
        JSON.stringify(updatedCodes),
      );
    }
  }, []);

  useEffect(() => {
    // Save users to localStorage whenever users array changes
    localStorage.setItem("casino-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    // Save referral codes to localStorage whenever referralCodes array changes
    localStorage.setItem(
      "casino-referral-codes",
      JSON.stringify(referralCodes),
    );
  }, [referralCodes]);

  useEffect(() => {
    // Save current user to localStorage
    if (user) {
      localStorage.setItem("casino-current-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("casino-current-user");
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = users.find((u) => u.email === ADMIN_EMAIL);
      if (adminUser) {
        const updatedAdmin = {
          ...adminUser,
          lastLogin: new Date().toISOString(),
        };
        setUser(updatedAdmin);
        updateUserInArray(updatedAdmin);
        return true;
      }
    }

    // Regular user login (simplified - in real app, you'd hash passwords)
    const foundUser = users.find((u) => u.email === email);
    if (foundUser) {
      // For demo purposes, any password works (in real app, you'd verify password hash)
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
      };
      setUser(updatedUser);
      updateUserInArray(updatedUser);
      return true;
    }

    return false;
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    promoCode?: string,
  ): Promise<{ success: boolean; message: string }> => {
    // Check if email already exists
    if (users.find((u) => u.email === email)) {
      return { success: false, message: "Email already exists" };
    }

    let bonusBalance = 0;
    let usedPromoCode = undefined;

    // Check promo code if provided
    if (promoCode) {
      const validCode = referralCodes.find(
        (r) => r.code === promoCode && r.isActive && !r.usedBy,
      );
      if (validCode) {
        bonusBalance = validCode.balance;
        usedPromoCode = promoCode;

        // Mark promo code as used (for single-use codes)
        setReferralCodes((prev) =>
          prev.map((r) =>
            r.code === promoCode
              ? { ...r, usedBy: email, usedAt: new Date().toISOString() }
              : r,
          ),
        );
      } else {
        return {
          success: false,
          message: "Invalid or already used promo code",
        };
      }
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      ...INITIAL_USER_DATA,
      balance: bonusBalance,
      usedReferralCode: usedPromoCode,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return {
      success: true,
      message:
        bonusBalance > 0
          ? `Account created! You received $${bonusBalance} from promo code!`
          : "Account created successfully!",
    };
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserInArray = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
  };

  const updateUserStats = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    );

    // Update current user if it's the same user
    if (user && user.id === userId) {
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const addGameToHistory = (
    userId: string,
    gameData: Omit<GameHistory, "id" | "timestamp">,
  ) => {
    const gameEntry: GameHistory = {
      ...gameData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newHistory = [gameEntry, ...u.gameHistory].slice(0, 100); // Keep last 100 games
          const newUser = { ...u, gameHistory: newHistory };

          // Update streaks
          if (gameData.result === "win") {
            newUser.winStreak = u.winStreak + 1;
            newUser.lossStreak = 0;
            newUser.maxWinStreak = Math.max(newUser.winStreak, u.maxWinStreak);
          } else {
            newUser.lossStreak = u.lossStreak + 1;
            newUser.winStreak = 0;
            newUser.maxLossStreak = Math.max(
              newUser.lossStreak,
              u.maxLossStreak,
            );
          }

          return newUser;
        }
        return u;
      }),
    );

    // Update current user if it's the same user
    if (user && user.id === userId) {
      checkAchievements(userId);
    }
  };

  const createReferralCode = (
    code: string,
    balance: number,
    createdFor?: string,
  ): boolean => {
    if (referralCodes.find((r) => r.code === code)) {
      return false; // Code already exists
    }

    const newCode: ReferralCode = {
      id: Date.now().toString(),
      code,
      createdBy: user?.id || "admin",
      createdFor,
      balance,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setReferralCodes((prev) => [...prev, newCode]);
    return true;
  };

  const useReferralCode = (
    userId: string,
    code: string,
  ): { success: boolean; message: string } => {
    const foundCode = referralCodes.find((r) => r.code === code && r.isActive);

    if (!foundCode) {
      return { success: false, message: "Invalid referral code" };
    }

    if (foundCode.usedBy) {
      return { success: false, message: "Referral code already used" };
    }

    if (foundCode.createdFor && foundCode.createdFor !== userId) {
      return { success: false, message: "This referral code is not for you" };
    }

    // Apply the referral code
    updateUserStats(userId, {
      balance: (user?.balance || 0) + foundCode.balance,
      usedReferralCode: code,
    });

    // Mark code as used
    setReferralCodes((prev) =>
      prev.map((r) =>
        r.code === code
          ? { ...r, usedBy: userId, usedAt: new Date().toISOString() }
          : r,
      ),
    );

    return {
      success: true,
      message: `Successfully redeemed $${foundCode.balance}!`,
    };
  };

  const checkAchievements = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const newAchievements = [...targetUser.achievements];
    let achievementsAdded = false;

    // Check each achievement
    if (
      targetUser.totalWinnings > 0 &&
      !newAchievements.includes("First Win")
    ) {
      newAchievements.push("First Win");
      achievementsAdded = true;
    }

    if (
      targetUser.gamesPlayed >= 10 &&
      !newAchievements.includes("Its Getting Somewhere")
    ) {
      newAchievements.push("Its Getting Somewhere");
      achievementsAdded = true;
    }

    if (
      targetUser.maxWinStreak >= 5 &&
      !newAchievements.includes("Hot Potato")
    ) {
      newAchievements.push("Hot Potato");
      achievementsAdded = true;
    }

    if (targetUser.maxWinStreak >= 20 && !newAchievements.includes("Inferno")) {
      newAchievements.push("Inferno");
      achievementsAdded = true;
    }

    if (
      targetUser.totalWinnings >= 100 &&
      !newAchievements.includes("Big Win")
    ) {
      newAchievements.push("Big Win");
      achievementsAdded = true;
    }

    if (
      targetUser.totalWinnings >= 2000 &&
      !newAchievements.includes("Massive")
    ) {
      newAchievements.push("Massive");
      achievementsAdded = true;
    }

    if (
      targetUser.gamesPlayed >= 100 &&
      !newAchievements.includes("True Gamer")
    ) {
      newAchievements.push("True Gamer");
      achievementsAdded = true;
    }

    if (
      targetUser.balance >= 9000 &&
      !newAchievements.includes("Its Over 9000")
    ) {
      newAchievements.push("Its Over 9000");
      achievementsAdded = true;
    }

    if (
      targetUser.maxLossStreak >= 10 &&
      !newAchievements.includes("THESE GAMES ARE RIGGED!")
    ) {
      newAchievements.push("THESE GAMES ARE RIGGED!");
      achievementsAdded = true;
    }

    if (targetUser.referralCode && !newAchievements.includes("Influence")) {
      newAchievements.push("Influence");
      achievementsAdded = true;
    }

    if (achievementsAdded) {
      updateUserStats(userId, { achievements: newAchievements });
    }
  };

  const deleteUser = (userId: string) => {
    if (userId === "admin") return; // Can't delete admin

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    // Logout if deleting current user
    if (user && user.id === userId) {
      logout();
    }
  };

  const getAllUsers = () => users;

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        referralCodes,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUserStats,
        addGameToHistory,
        createReferralCode,
        useReferralCode,
        checkAchievements,
        deleteUser,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
