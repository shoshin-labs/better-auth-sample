"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Suspense } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const result = await authClient.verifyEmail({
          query: { token },
        });

        if (result.error) {
          setStatus("error");
          setMessage(result.error.message || "Verification failed");
          return;
        }

        setStatus("success");
        setMessage("Your email has been verified successfully");
      } catch {
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          {status === "loading" && "Verifying your email..."}
          {status === "success" && "Verification successful"}
          {status === "error" && "Verification failed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {status === "loading" && (
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-center text-muted-foreground">{message}</p>
            <Button onClick={() => router.push("/dashboard")}>
              Continue to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-center text-muted-foreground">{message}</p>
          </>
        )}
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p className="w-full text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
