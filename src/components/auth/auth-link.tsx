"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ComponentProps } from "react";

type AuthLinkProps = ComponentProps<typeof Link>;

export function AuthLink({ href, children, ...props }: AuthLinkProps) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Build the new URL with the redirect param preserved
  const hrefString = typeof href === "string" ? href : href.pathname || "";
  const url = new URL(hrefString, "http://localhost");
  
  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }

  const finalHref = url.pathname + url.search;

  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  );
}
