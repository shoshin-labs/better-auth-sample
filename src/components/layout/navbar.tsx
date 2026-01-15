"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { OrgSwitcher } from "@/components/organizations/org-switcher";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-6 flex h-14 items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-xl">
            Better Auth Demo
          </Link>
          {session && <OrgSwitcher />}
        </div>

        <nav className="ml-auto flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              {session.user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <ThemeToggle />
              <UserMenu />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
