import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get current session to find user ID
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    // Query accounts for this user
    const accounts = await db
      .select({
        id: account.id,
        providerId: account.providerId,
        accountId: account.accountId,
      })
      .from(account)
      .where(eq(account.userId, session.user.id));

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("List accounts error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
