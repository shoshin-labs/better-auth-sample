"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  MoreVertical,
  Ban,
  UserCheck,
  Eye,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { admin, useSession } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
}

export function UsersPageContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const result = await admin.listUsers({
          query: {
            limit: 100,
          },
        });

        if (result.data) {
          setUsers(result.data.users as User[]);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function handleBanUser(userId: string) {
    try {
      const result = await admin.banUser({
        userId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to ban user");
        return;
      }

      toast.success("User banned");
      setUsers(users.map((u) => (u.id === userId ? { ...u, banned: true } : u)));
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleUnbanUser(userId: string) {
    try {
      const result = await admin.unbanUser({
        userId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to unban user");
        return;
      }

      toast.success("User unbanned");
      setUsers(users.map((u) => (u.id === userId ? { ...u, banned: false } : u)));
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleImpersonate(userId: string) {
    try {
      const result = await admin.impersonateUser({
        userId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to impersonate user");
        return;
      }

      toast.success("Now impersonating user");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage all users on the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users ({users.length})</CardTitle>
              <CardDescription>
                View and manage user accounts
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isCurrentUser = user.id === session?.user.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                      >
                        {user.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleImpersonate(user.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Impersonate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.banned ? (
                              <DropdownMenuItem
                                onClick={() => handleUnbanUser(user.id)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleBanUser(user.id)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
