import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
  Shield,
  Edit3,
  Trash2,
  Save,
  X,
  UserPlus,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const {
    user,
    users,
    referralCodes,
    promoCodes,
    updateUserStats,
    deleteUser,
    createPromoCode,
    createReferralCode,
    logout,
  } = useAuth();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    balance: 0,
    totalWinnings: 0,
    totalLosses: 0,
    gamesPlayed: 0,
  });
  const [showCreateCodeDialog, setShowCreateCodeDialog] = useState(false);
  const [newCodeForm, setNewCodeForm] = useState({
    code: "",
    balance: 100,
    createdFor: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find((u) => u.id === userId);
    if (userToEdit) {
      setEditForm({
        username: userToEdit.username,
        balance: userToEdit.balance,
        totalWinnings: userToEdit.totalWinnings,
        totalLosses: userToEdit.totalLosses,
        gamesPlayed: userToEdit.gamesPlayed,
      });
      setEditingUser(userId);
    }
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUserStats(editingUser, editForm);
      setEditingUser(null);
      toast.success("User updated successfully!");
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    toast.success("User deleted successfully!");
  };

  const handleCreateReferralCode = () => {
    if (!newCodeForm.code || newCodeForm.balance <= 0) {
      toast.error("Please enter a valid code and balance");
      return;
    }

    const success = createReferralCode(
      newCodeForm.code,
      newCodeForm.balance,
      newCodeForm.createdFor || undefined,
    );

    if (success) {
      toast.success("Referral code created successfully!");
      setShowCreateCodeDialog(false);
      setNewCodeForm({ code: "", balance: 100, createdFor: "" });
    } else {
      toast.error("Referral code already exists!");
    }
  };

  const regularUsers = users.filter((u) => !u.isAdmin);
  const totalUsers = users.length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const totalGamesPlayed = users.reduce((sum, u) => sum + u.gamesPlayed, 0);

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
              <div className="bg-gradient-to-r from-casino-red to-casino-red-dark p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-casino-gold">
                  Admin Panel
                </h1>
                <p className="text-sm text-casino-gold/70">User Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="bg-casino-red/20 text-casino-red"
            >
              Admin: {user?.username}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-casino-black/60 border-casino-gold/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-casino-gold">
                {totalUsers}
              </h3>
              <p className="text-sm text-white/70">Total Users</p>
            </CardContent>
          </Card>

          <Card className="bg-casino-black/60 border-casino-gold/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-casino-green">
                {regularUsers.length}
              </h3>
              <p className="text-sm text-white/70">Regular Users</p>
            </CardContent>
          </Card>

          <Card className="bg-casino-black/60 border-casino-gold/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-casino-purple">
                {formatCurrency(totalBalance)}
              </h3>
              <p className="text-sm text-white/70">Total Balance</p>
            </CardContent>
          </Card>

          <Card className="bg-casino-black/60 border-casino-gold/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-casino-red">
                {totalGamesPlayed}
              </h3>
              <p className="text-sm text-white/70">Games Played</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Codes Management */}
        <Card className="bg-casino-black/60 border-casino-gold/30">
          <CardHeader>
            <CardTitle className="text-casino-gold flex items-center justify-between">
              <span>Referral Codes</span>
              <Dialog
                open={showCreateCodeDialog}
                onOpenChange={setShowCreateCodeDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-casino-purple hover:bg-casino-purple-dark"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-casino-black border-casino-gold/30">
                  <DialogHeader>
                    <DialogTitle className="text-casino-gold">
                      Create Referral Code
                    </DialogTitle>
                    <DialogDescription className="text-white/70">
                      Create a new referral code for users to claim bonuses
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Code</Label>
                      <Input
                        value={newCodeForm.code}
                        onChange={(e) =>
                          setNewCodeForm({
                            ...newCodeForm,
                            code: e.target.value,
                          })
                        }
                        placeholder="Enter unique code"
                        className="bg-casino-black-light border-casino-gold/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Balance Bonus</Label>
                      <Input
                        type="number"
                        value={newCodeForm.balance}
                        onChange={(e) =>
                          setNewCodeForm({
                            ...newCodeForm,
                            balance: Number(e.target.value),
                          })
                        }
                        placeholder="100"
                        className="bg-casino-black-light border-casino-gold/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">
                        Created For (Optional)
                      </Label>
                      <Input
                        value={newCodeForm.createdFor}
                        onChange={(e) =>
                          setNewCodeForm({
                            ...newCodeForm,
                            createdFor: e.target.value,
                          })
                        }
                        placeholder="Specific user ID (leave empty for anyone)"
                        className="bg-casino-black-light border-casino-gold/30 text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateCodeDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateReferralCode}
                      className="bg-casino-purple hover:bg-casino-purple-dark"
                    >
                      Create Code
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription className="text-white/70">
              Manage referral codes and promo codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-casino-gold/20">
                    <TableHead className="text-casino-gold">Code</TableHead>
                    <TableHead className="text-casino-gold">Balance</TableHead>
                    <TableHead className="text-casino-gold">
                      Created For
                    </TableHead>
                    <TableHead className="text-casino-gold">Used By</TableHead>
                    <TableHead className="text-casino-gold">Status</TableHead>
                    <TableHead className="text-casino-gold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralCodes.map((code) => (
                    <TableRow
                      key={code.id}
                      className="border-casino-gold/10 hover:bg-casino-black/30"
                    >
                      <TableCell className="text-white font-semibold">
                        {code.code}
                      </TableCell>
                      <TableCell className="text-casino-green">
                        {formatCurrency(code.balance)}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {code.createdFor || "Anyone"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {code.usedBy || "Not used"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            code.usedBy
                              ? "bg-casino-red/20 text-casino-red"
                              : "bg-casino-green/20 text-casino-green"
                          }
                        >
                          {code.usedBy ? "Used" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {formatDate(code.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* User Management Table */}
        <Card className="bg-casino-black/60 border-casino-gold/30">
          <CardHeader>
            <CardTitle className="text-casino-gold flex items-center justify-between">
              <span>User Management</span>
              <Link to="/register">
                <Button
                  size="sm"
                  className="bg-casino-green hover:bg-casino-green-dark"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </Link>
            </CardTitle>
            <CardDescription className="text-white/70">
              Manage all registered users and their statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-casino-gold/20">
                    <TableHead className="text-casino-gold">User</TableHead>
                    <TableHead className="text-casino-gold">Email</TableHead>
                    <TableHead className="text-casino-gold">Balance</TableHead>
                    <TableHead className="text-casino-gold">Winnings</TableHead>
                    <TableHead className="text-casino-gold">Losses</TableHead>
                    <TableHead className="text-casino-gold">Games</TableHead>
                    <TableHead className="text-casino-gold">Joined</TableHead>
                    <TableHead className="text-casino-gold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow
                      key={userData.id}
                      className="border-casino-gold/10 hover:bg-casino-black/30"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">
                            {userData.username}
                          </span>
                          {userData.isAdmin && (
                            <Badge
                              variant="secondary"
                              className="bg-casino-red/20 text-casino-red text-xs"
                            >
                              Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80">
                        {userData.email}
                      </TableCell>
                      <TableCell className="text-casino-green font-semibold">
                        {formatCurrency(userData.balance)}
                      </TableCell>
                      <TableCell className="text-casino-green">
                        {formatCurrency(userData.totalWinnings)}
                      </TableCell>
                      <TableCell className="text-casino-red">
                        {formatCurrency(userData.totalLosses)}
                      </TableCell>
                      <TableCell className="text-white">
                        {userData.gamesPlayed}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {formatDate(userData.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {editingUser === userData.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={handleSaveUser}
                                className="bg-casino-green hover:bg-casino-green-dark"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                                className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(userData.id)}
                                className="border-casino-gold text-casino-gold hover:bg-casino-gold hover:text-casino-black"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              {!userData.isAdmin && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-casino-black border-casino-gold/30">
                                    <DialogHeader>
                                      <DialogTitle className="text-casino-gold">
                                        Delete User
                                      </DialogTitle>
                                      <DialogDescription className="text-white/70">
                                        Are you sure you want to delete{" "}
                                        {userData.username}? This action cannot
                                        be undone.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline">Cancel</Button>
                                      <Button
                                        onClick={() =>
                                          handleDeleteUser(userData.id)
                                        }
                                        className="bg-casino-red hover:bg-casino-red-dark"
                                      >
                                        Delete
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="bg-casino-black border-casino-gold/30 w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-casino-gold">Edit User</CardTitle>
                <CardDescription className="text-white/70">
                  Update user statistics and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Username</Label>
                  <Input
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    className="bg-casino-black-light border-casino-gold/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Balance</Label>
                  <Input
                    type="number"
                    value={editForm.balance}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        balance: Number(e.target.value),
                      })
                    }
                    className="bg-casino-black-light border-casino-gold/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Total Winnings</Label>
                    <Input
                      type="number"
                      value={editForm.totalWinnings}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          totalWinnings: Number(e.target.value),
                        })
                      }
                      className="bg-casino-black-light border-casino-gold/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Total Losses</Label>
                    <Input
                      type="number"
                      value={editForm.totalLosses}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          totalLosses: Number(e.target.value),
                        })
                      }
                      className="bg-casino-black-light border-casino-gold/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Games Played</Label>
                  <Input
                    type="number"
                    value={editForm.gamesPlayed}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        gamesPlayed: Number(e.target.value),
                      })
                    }
                    className="bg-casino-black-light border-casino-gold/30 text-white"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleSaveUser}
                    className="flex-1 bg-casino-green hover:bg-casino-green-dark"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                    className="border-casino-red text-casino-red hover:bg-casino-red hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
