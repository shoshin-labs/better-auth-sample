"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  UserPlus,
  MoreVertical,
  Trash2,
  UserCog,
  Mail,
  X,
  Clock,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { organization, useSession } from "@/lib/auth-client";

interface Member {
  id: string;
  role: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  organizationId: string;
}

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function MembersPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { data: session } = useSession();

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  useEffect(() => {
    async function loadMembersAndInvitations() {
      try {
        const [orgResult, invitationsResult] = await Promise.all([
          organization.getFullOrganization({
            query: { organizationId: orgId },
          }),
          organization.listInvitations({
            query: { organizationId: orgId },
          }),
        ]);

        if (orgResult.data) {
          setMembers(orgResult.data.members as unknown as Member[]);
          // Find current user's membership
          const member = (orgResult.data.members as unknown as Member[]).find(
            (m) => m.user.id === session?.user.id
          );
          if (member) {
            setCurrentMember(member);
          }
        }

        if (invitationsResult.data) {
          // Filter to only show pending invitations
          const pendingInvitations = (invitationsResult.data as unknown as Invitation[]).filter(
            (inv) => inv.status === "pending"
          );
          setInvitations(pendingInvitations);
        }
      } catch {
        toast.error("Failed to load members");
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadMembersAndInvitations();
    }
  }, [orgId, session]);

  async function onSubmit(data: InviteFormData) {
    setInviting(true);
    try {
      const result = await organization.inviteMember({
        organizationId: orgId,
        email: data.email,
        role: data.role,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send invitation");
        return;
      }

      toast.success(`Invitation sent to ${data.email}`);
      form.reset();
      setDialogOpen(false);
      // Refresh invitations list
      const invitationsResult = await organization.listInvitations({
        query: { organizationId: orgId },
      });
      if (invitationsResult.data) {
        const pendingInvitations = (invitationsResult.data as unknown as Invitation[]).filter(
          (inv) => inv.status === "pending"
        );
        setInvitations(pendingInvitations);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      const result = await organization.removeMember({
        organizationId: orgId,
        memberIdOrEmail: memberId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to remove member");
        return;
      }

      toast.success("Member removed");
      setMembers(members.filter((m) => m.id !== memberId));
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleUpdateRole(memberId: string, newRole: string) {
    try {
      const result = await organization.updateMemberRole({
        organizationId: orgId,
        memberId,
        role: newRole,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to update role");
        return;
      }

      toast.success("Role updated");
      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleCancelInvitation(invitationId: string) {
    setCancellingInvite(invitationId);
    try {
      const result = await organization.cancelInvitation({
        invitationId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to cancel invitation");
        return;
      }

      toast.success("Invitation cancelled");
      setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setCancellingInvite(null);
    }
  }

  const isOwnerOrAdmin =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground mt-2">
            Manage organization members
          </p>
        </div>
        {isOwnerOrAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join this organization
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="colleague@example.com"
                            disabled={inviting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={inviting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={inviting}>
                    {inviting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Invitation
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isOwnerOrAdmin && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({invitations.length})
            </CardTitle>
            <CardDescription>
              Invitations that haven&apos;t been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const expiresAt = new Date(invitation.expiresAt);
                const isExpired = expiresAt < new Date();
                
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {isExpired ? (
                            <span className="text-destructive">Expired</span>
                          ) : (
                            <span>
                              Expires {expiresAt.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{invitation.role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={cancellingInvite === invitation.id}
                      >
                        {cancellingInvite === invitation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => {
              const isCurrentUser = member.user.id === session?.user.id;
              const canManage =
                isOwnerOrAdmin && !isCurrentUser && member.role !== "owner";

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.image || ""} />
                      <AvatarFallback>
                        {member.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.user.name}</p>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.role === "owner" ? "default" : "secondary"}
                    >
                      {member.role}
                    </Badge>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateRole(
                                member.id,
                                member.role === "admin" ? "member" : "admin"
                              )
                            }
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Make {member.role === "admin" ? "Member" : "Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
