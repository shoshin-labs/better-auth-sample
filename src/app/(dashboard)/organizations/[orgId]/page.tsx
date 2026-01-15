"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  UserPlus,
  Settings,
  Building2,
  Layers,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { organization } from "@/lib/auth-client";

interface Organization {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: Date;
  metadata: string | null;
}

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

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  useEffect(() => {
    async function loadOrg() {
      try {
        const orgResult = await organization.getFullOrganization({
          query: { organizationId: orgId },
        });

        if (orgResult.data) {
          setOrg(orgResult.data as unknown as Organization);
          setMembers(orgResult.data.members as unknown as Member[]);

          // Find current user's membership
          const member = (orgResult.data.members as unknown as Member[]).find(
            (m) => m.organizationId === orgId
          );
          if (member) {
            setCurrentMember(member);
          }
        }
      } catch {
        toast.error("Failed to load organization");
      } finally {
        setLoading(false);
      }
    }

    loadOrg();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Organization not found</h2>
        <Button className="mt-4" onClick={() => router.push("/organizations")}>
          Back to Organizations
        </Button>
      </div>
    );
  }

  const isOwnerOrAdmin =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{org.name}</h1>
            <p className="text-muted-foreground">/{org.slug}</p>
          </div>
        </div>
        {isOwnerOrAdmin && (
          <Link href={`/organizations/${orgId}/settings`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/organizations/${orgId}/members`}>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Members</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{members.length}</p>
              <CardDescription>Active members</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/organizations/${orgId}/teams`}>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Teams</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <CardDescription>Teams created</CardDescription>
            </CardContent>
          </Card>
        </Link>

        {isOwnerOrAdmin && (
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => router.push(`/organizations/${orgId}/members`)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Invite</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Invite new members to join your organization
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Members</CardTitle>
          <CardDescription>
            People who recently joined your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {member.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={member.role === "owner" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No members yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
