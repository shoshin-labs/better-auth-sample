import Link from "next/link";
import {
  Shield,
  Key,
  Fingerprint,
  Building2,
  Users,
  Smartphone,
  Github,
  Mail,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Mail,
    title: "Email/Password",
    description: "Classic authentication with email verification and password reset",
  },
  {
    icon: Github,
    title: "Social OAuth",
    description: "Sign in with Google, GitHub, Discord, and more",
  },
  {
    icon: Key,
    title: "Magic Links",
    description: "Passwordless authentication via email links",
  },
  {
    icon: Fingerprint,
    title: "Passkeys",
    description: "WebAuthn/FIDO2 biometric authentication",
  },
  {
    icon: Smartphone,
    title: "Two-Factor Auth",
    description: "TOTP, Email OTP, and backup codes",
  },
  {
    icon: Building2,
    title: "Organizations",
    description: "Multi-tenant with teams and role-based access",
  },
  {
    icon: Users,
    title: "Anonymous Sessions",
    description: "Guest mode with account linking",
  },
  {
    icon: Shield,
    title: "Admin Dashboard",
    description: "User management, ban, and impersonation",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Zap className="h-4 w-4" />
            Better Auth Demo
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            The Most Comprehensive
            <br />
            <span className="text-primary">Auth Framework</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A complete demonstration of Better Auth features including
            email/password, social OAuth, passkeys, 2FA, organizations, and
            admin capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need for Auth
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Better Auth provides a complete authentication and authorization
              solution with plugins for every use case.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Instructions */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Try It Out</h2>
            <p className="text-muted-foreground">
              Explore all the authentication features in this demo app
            </p>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Create an Account</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Sign up with your email or use a social provider. Try the
                  magic link option for passwordless sign-in.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. Enable Security Features</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Go to Security settings to enable two-factor authentication or
                  register a passkey for biometric login.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>3. Create an Organization</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Create an organization, invite team members, and manage roles.
                  Create teams within organizations for granular access control.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>4. Admin Features</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  To test admin features, manually update your user role to
                  &quot;admin&quot; in the database. Then access /admin to manage users
                  and sessions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>
            Built with{" "}
            <a
              href="https://better-auth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Better Auth
            </a>
            {" "}+{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Next.js
            </a>
            {" "}+{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              shadcn/ui
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
