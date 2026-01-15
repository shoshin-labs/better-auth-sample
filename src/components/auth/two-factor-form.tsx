"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { twoFactor } from "@/lib/auth-client";

const formSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type FormData = z.infer<typeof formSchema>;

export function TwoFactorForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(
      useBackupCode
        ? z.object({ code: z.string().min(1, "Backup code is required") })
        : formSchema
    ),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      let result;

      if (useBackupCode) {
        result = await twoFactor.verifyBackupCode({
          code: data.code,
        });
      } else {
        result = await twoFactor.verifyTotp({
          code: data.code,
        });
      }

      if (result.error) {
        toast.error(result.error.message || "Invalid code");
        return;
      }

      toast.success("Verified successfully");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {useBackupCode ? "Backup Code" : "Authentication Code"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={useBackupCode ? "Enter backup code" : "000000"}
                    autoComplete="one-time-code"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </form>
      </Form>

      <Button
        variant="link"
        className="w-full"
        onClick={() => {
          setUseBackupCode(!useBackupCode);
          form.reset();
        }}
      >
        {useBackupCode ? "Use authenticator app" : "Use backup code instead"}
      </Button>
    </div>
  );
}
