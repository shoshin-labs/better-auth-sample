"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { organization, useSession } from "@/lib/auth-client";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "success" | "error">("loading");
  const [invitation, setInvitation] = useState<{
    organizationName: string;
    organizationSlug: string;
    inviterEmail: string;
    role: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invitationId = params.id as string;

  useEffect(() => {
    async function loadInvitation() {
      try {
        const result = await organization.getInvitation({
          query: { id: invitationId },
        });

        if (result.error) {
          setError(result.error.message || "Invitation not found or expired");
          setStatus("error");
          return;
        }

        if (result.data) {
          setInvitation({
            organizationName: result.data.organizationName,
            organizationSlug: result.data.organizationSlug,
            inviterEmail: result.data.inviterEmail,
            role: result.data.role,
          });
          setStatus("ready");
        }
      } catch {
        setError("Failed to load invitation");
        setStatus("error");
      }
    }

    if (invitationId) {
      loadInvitation();
    }
  }, [invitationId]);

  async function handleAccept() {
    setStatus("accepting");
    try {
      const result = await organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to accept invitation");
        setStatus("ready");
        return;
      }

      setStatus("success");
      toast.success("Invitation accepted!");

      // Redirect to the organization
      setTimeout(() => {
        router.push("/organizations");
      }, 1500);
    } catch {
      toast.error("An unexpected error occurred");
      setStatus("ready");
    }
  }

  async function handleReject() {
    try {
      const result = await organization.rejectInvitation({
        invitationId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to reject invitation");
        return;
      }

      toast.success("Invitation rejected");
      router.push("/");
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  if (sessionLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              Please sign in to accept this invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push(`/sign-in?redirect=/organizations/invite/${invitationId}`)}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              You&apos;ve joined {invitation?.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-muted-foreground">Redirecting...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {invitation && (
            <div className="space-y-4 text-center">
              <div>
                <p className="text-lg font-semibold">{invitation.organizationName}</p>
                <p className="text-sm text-muted-foreground">
                  Invited by {invitation.inviterEmail}
                </p>
              </div>
              <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm">
                Role: <span className="font-medium capitalize">{invitation.role}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReject}
            >
              Decline
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={status === "accepting"}
            >
              {status === "accepting" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
