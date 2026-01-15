"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useListOrganizations, useActiveOrganization, organization } from "@/lib/auth-client";

export function OrgSwitcher() {
  const router = useRouter();
  const { data: orgs, isPending: orgsLoading } = useListOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const [switching, setSwitching] = useState(false);

  async function handleOrgSelect(orgId: string | null) {
    setSwitching(true);
    try {
      await organization.setActive({
        organizationId: orgId,
      });
      router.refresh();
    } catch {
      toast.error("Failed to switch organization");
    } finally {
      setSwitching(false);
    }
  }

  if (orgsLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Building2 className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={switching}>
          <Building2 className="mr-2 h-4 w-4" />
          {activeOrg?.name || "Personal"}
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOrgSelect(null)}>
          <div className="flex items-center justify-between w-full">
            <span>Personal</span>
            {!activeOrg && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
        {orgs?.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrgSelect(org.id)}
          >
            <div className="flex items-center justify-between w-full">
              <span>{org.name}</span>
              {activeOrg?.id === org.id && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/organizations")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
