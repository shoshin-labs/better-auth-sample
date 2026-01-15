import { Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { PasskeyButton } from "@/components/auth/passkey-button";
import { getEnabledProviders } from "@/lib/get-enabled-providers";
import { AuthLink } from "@/components/auth/auth-link";

function SignInContent() {
  const enabledProviders = getEnabledProviders();
  const hasSocialProviders = enabledProviders.length > 0;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignInForm />

        {hasSocialProviders && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <SocialButtons enabledProviders={enabledProviders} />
          </>
        )}

        <PasskeyButton />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          Forgot your password?
        </Link>
        <Link
          href="/magic-link"
          className="text-muted-foreground hover:text-primary hover:underline"
        >
          Sign in with magic link
        </Link>
        <Separator className="my-2" />
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <AuthLink href="/sign-up" className="text-primary hover:underline">
            Sign up
          </AuthLink>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
