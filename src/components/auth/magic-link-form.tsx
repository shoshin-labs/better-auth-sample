"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

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
import { magicLink } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function MagicLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await magicLink.sendMagicLink({
        email: data.email,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send magic link");
        return;
      }

      setEmailSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a magic link to{" "}
            <span className="font-medium">{form.getValues("email")}</span>
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setEmailSent(false)}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
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
          Send Magic Link
        </Button>
      </form>
    </Form>
  );
}
