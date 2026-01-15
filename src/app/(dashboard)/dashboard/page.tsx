"use client";

import Link from "next/link";
import {
  User,
  Shield,
  Building2,
  Key,
  Fingerprint,
  Mail,
  Smartphone,
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
import { useSession } from "@/lib/auth-client";

const features = [
  {
    title: "Profile",
    description: "Update your name, avatar, and email",
    href: "/profile",
    icon: User,
  },
  {
    title: "Security",
    description: "Manage 2FA, passkeys, and sessions",
    href: "/security",
    icon: Shield,
  },
  {
    title: "Organizations",
    description: "Create and manage organizations",
    href: "/organizations",
    icon: Building2,
  },
];

const authMethods = [
  { name: "Email/Password", icon: Mail, status: "active" },
  { name: "Two-Factor Auth", icon: Smartphone, status: "available" },
  { name: "Passkeys", icon: Fingerprint, status: "available" },
  { name: "Magic Link", icon: Key, status: "available" },
];

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and explore Better Auth features
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
          <CardDescription>
            Better Auth supports multiple authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {authMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <method.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{method.name}</p>
                </div>
                <Badge
                  variant={method.status === "active" ? "default" : "secondary"}
                >
                  {method.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/security">
            <Button variant="outline">Enable 2FA</Button>
          </Link>
          <Link href="/security">
            <Button variant="outline">Add Passkey</Button>
          </Link>
          <Link href="/organizations">
            <Button variant="outline">Create Organization</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Update Profile</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
