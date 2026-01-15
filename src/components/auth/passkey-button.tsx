"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Fingerprint } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export function PasskeyButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handlePasskeySignIn() {
    setIsLoading(true);
    try {
      const result = await signIn.passkey();

      if (result?.error) {
        toast.error(result.error.message || "Passkey sign in failed");
        return;
      }

      toast.success("Signed in with passkey");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Passkey not available or cancelled");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handlePasskeySignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Fingerprint className="mr-2 h-4 w-4" />
      )}
      Sign in with Passkey
    </Button>
  );
}
