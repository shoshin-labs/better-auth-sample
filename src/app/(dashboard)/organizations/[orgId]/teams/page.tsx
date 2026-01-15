"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Users, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { organization } from "@/lib/auth-client";

interface Team {
  id: string;
  name: string;
  organizationId: string;
  createdAt: Date;
}

const createTeamSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export default function TeamsPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    async function loadTeams() {
      try {
        const result = await organization.listTeams({
          query: { organizationId: orgId },
        });

        if (result.data) {
          setTeams(result.data as Team[]);
        }
      } catch {
        console.error("Failed to load teams");
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, [orgId]);

  async function onSubmit(data: CreateTeamFormData) {
    setCreating(true);
    try {
      const result = await organization.createTeam({
        name: data.name,
        organizationId: orgId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create team");
        return;
      }

      toast.success("Team created successfully");
      form.reset();
      setDialogOpen(false);

      // Reload teams
      const teamsResult = await organization.listTeams({
        query: { organizationId: orgId },
      });
      if (teamsResult.data) {
        setTeams(teamsResult.data as Team[]);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTeam(teamId: string) {
    try {
      const result = await organization.deleteTeam({
        teamId,
        organizationId: orgId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to delete team");
        return;
      }

      toast.success("Team deleted");
      setTeams(teams.filter((t) => t.id !== teamId));
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Organize members into teams
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
                Create a new team within your organization
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Engineering"
                          disabled={creating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Team
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Created {new Date(team.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No teams yet</h3>
            <p className="text-muted-foreground text-center mt-2 mb-4">
              Create teams to organize your members
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
