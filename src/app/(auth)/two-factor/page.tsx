import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TwoFactorForm } from "@/components/auth/two-factor-form";

export default function TwoFactorPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorForm />
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p className="w-full text-muted-foreground">
          Having trouble?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Try signing in again
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
