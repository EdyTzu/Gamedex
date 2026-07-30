import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { verifySteamCallback } from "@/lib/steam";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const steamId = await verifySteamCallback(req.nextUrl.searchParams);

  if (!steamId) {
    return NextResponse.redirect(new URL("/profile?steam=invalid", req.url));
  }

  const alreadyTaken = await sql`
    SELECT id FROM users WHERE steam_id = ${steamId} AND id <> ${userId}
  `;

  if (alreadyTaken.length > 0) {
    return NextResponse.redirect(new URL("/profile?steam=taken", req.url));
  }

  await sql`
    INSERT INTO users (id, steam_id, steam_linked_at)
    VALUES (${userId}, ${steamId}, now())
    ON CONFLICT (id) DO UPDATE
      SET steam_id = ${steamId}, steam_linked_at = now()
  `;

  return NextResponse.redirect(new URL("/profile?steam=linked", req.url));
}
