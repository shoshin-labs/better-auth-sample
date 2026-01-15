"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Smartphone,
  Fingerprint,
  Monitor,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useSession,
  twoFactor,
  passkey,
  listSessions,
  revokeSession,
  revokeOtherSessions,
} from "@/lib/auth-client";

interface PasskeyCredential {
  id: string;
  name: string | null;
  createdAt: Date | null;
}

interface Session {
  id: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  userId: string;
}

export default function SecurityPage() {
  const { data: session, isPending } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [password2FA, setPassword2FA] = useState("");
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionsResult = await listSessions();
        if (sessionsResult.data) {
          setSessions(sessionsResult.data as Session[]);
        }

        const passkeysResult = await passkey.listUserPasskeys();
        if (passkeysResult.data) {
          setPasskeys(passkeysResult.data as PasskeyCredential[]);
        }

        // Check if user has a password by looking at linked accounts
        const accountsRes = await fetch("/api/auth/list-accounts", {
          credentials: "include",
        });
        if (accountsRes.ok) {
          const accounts = await accountsRes.json();
          const hasCredential = accounts.some(
            (acc: { providerId: string }) => acc.providerId === "credential"
          );
          setHasPassword(hasCredential);
        }
      } catch {
        console.error("Failed to load security data");
      } finally {
        setLoadingSessions(false);
      }
    }

    loadData();
  }, []);

  async function handleSetPassword() {
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSettingPassword(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to set password");
        return;
      }

      toast.success("Password set successfully! You can now enable 2FA.");
      setHasPassword(true);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSettingPassword(false);
    }
  }

  async function handleEnable2FA() {
    if (!password2FA) {
      toast.error("Please enter your password");
      return;
    }
    setEnabling2FA(true);
    try {
      const result = await twoFactor.enable({ password: password2FA });
      if (result.error) {
        toast.error(result.error.message || "Failed to enable 2FA");
        return;
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI);
        setBackupCodes(result.data.backupCodes || null);
        setPassword2FA("");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setEnabling2FA(false);
    }
  }

  async function handleVerify2FA() {
    try {
      const result = await twoFactor.verifyTotp({ code: verifyCode });
      if (result.error) {
        toast.error(result.error.message || "Invalid code");
        return;
      }

      toast.success("Two-factor authentication enabled");
      setTotpUri(null);
      setVerifyCode("");
      window.location.reload();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleDisable2FA() {
    if (!password2FA) {
      toast.error("Please enter your password");
      return;
    }
    setDisabling2FA(true);
    try {
      const result = await twoFactor.disable({ password: password2FA });
      if (result.error) {
        toast.error(result.error.message || "Failed to disable 2FA");
        return;
      }

      toast.success("Two-factor authentication disabled");
      setPassword2FA("");
      window.location.reload();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setDisabling2FA(false);
    }
  }

  async function handleAddPasskey() {
    setAddingPasskey(true);
    try {
      const result = await passkey.addPasskey({ name: "My Passkey" });
      if (result?.error) {
        toast.error(result.error.message || "Failed to add passkey");
        return;
      }

      toast.success("Passkey added successfully");
      const passkeysResult = await passkey.listUserPasskeys();
      if (passkeysResult.data) {
        setPasskeys(passkeysResult.data as PasskeyCredential[]);
      }
    } catch {
      toast.error("Passkey registration cancelled or not supported");
    } finally {
      setAddingPasskey(false);
    }
  }

  async function handleDeletePasskey(passkeyId: string) {
    try {
      const result = await passkey.deletePasskey({ id: passkeyId });
      if (result?.error) {
        toast.error(result.error.message || "Failed to delete passkey");
        return;
      }

      toast.success("Passkey deleted");
      setPasskeys(passkeys.filter((p) => p.id !== passkeyId));
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleRevokeSession(sessionToken: string) {
    try {
      const result = await revokeSession({ token: sessionToken });
      if (result.error) {
        toast.error(result.error.message || "Failed to revoke session");
        return;
      }

      toast.success("Session revoked");
      setSessions(sessions.filter((s) => s.token !== sessionToken));
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  async function handleRevokeAllSessions() {
    try {
      const result = await revokeOtherSessions();
      if (result.error) {
        toast.error(result.error.message || "Failed to revoke sessions");
        return;
      }

      toast.success("All other sessions revoked");
      const sessionsResult = await listSessions();
      if (sessionsResult.data) {
        setSessions(sessionsResult.data as Session[]);
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const is2FAEnabled = session?.user.twoFactorEnabled;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground mt-2">
          Manage your security settings and authentication methods
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <Badge variant={is2FAEnabled ? "default" : "secondary"}>
              {is2FAEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {is2FAEnabled ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter your password to disable 2FA
                </label>
                <Input
                  type="password"
                  placeholder="Your current password"
                  value={password2FA}
                  onChange={(e) => setPassword2FA(e.target.value)}
                />
              </div>
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={disabling2FA || !password2FA}
              >
                {disabling2FA && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Disable 2FA
              </Button>
            </div>
          ) : totpUri ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                    alt="TOTP QR Code"
                    className="rounded"
                  />
                </div>
              </div>

              {backupCodes && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Save these backup codes somewhere safe:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                      <code key={i} className="text-sm bg-background p-1 rounded">
                        {code}
                      </code>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodes.join("\n"));
                      toast.success("Backup codes copied");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Enter 6-digit code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={handleVerify2FA} disabled={verifyCode.length !== 6}>
                  Verify
                </Button>
              </div>
            </div>
          ) : hasPassword === false ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You signed up with a social provider and don&apos;t have a password yet.
                Set a password to enable two-factor authentication.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSetPassword}
                disabled={settingPassword || !newPassword || !confirmNewPassword}
              >
                {settingPassword && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Set Password
              </Button>
            </div>
          ) : hasPassword ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter your password to enable 2FA
                </label>
                <Input
                  type="password"
                  placeholder="Your current password"
                  value={password2FA}
                  onChange={(e) => setPassword2FA(e.target.value)}
                />
              </div>
              <Button onClick={handleEnable2FA} disabled={enabling2FA || !password2FA}>
                {enabling2FA && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enable 2FA
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passkeys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            <CardTitle>Passkeys</CardTitle>
          </div>
          <CardDescription>
            Use biometrics or security keys to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passkeys.length > 0 ? (
            <div className="space-y-2">
              {passkeys.map((pk) => (
                <div
                  key={pk.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{pk.name || "Passkey"}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {pk.createdAt ? new Date(pk.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePasskey(pk.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No passkeys registered yet
            </p>
          )}
          <Button onClick={handleAddPasskey} disabled={addingPasskey}>
            {addingPasskey && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Passkey
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleRevokeAllSessions}>
                Revoke All Others
              </Button>
            )}
          </div>
          <CardDescription>
            Manage your active sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((s) => {
                const isCurrent = s.token === session?.session.token;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {s.userAgent?.split(" ")[0] || "Unknown Device"}
                          </p>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {s.ipAddress || "Unknown IP"} • Last active{" "}
                          {new Date(s.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(s.token)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
