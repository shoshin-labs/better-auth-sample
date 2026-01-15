import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function MagicLinkPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in with Magic Link</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MagicLinkForm />
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p className="w-full text-muted-foreground">
          Back to{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
