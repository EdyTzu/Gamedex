import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { buildSteamLoginUrl } from "@/lib/steam";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.redirect(buildSteamLoginUrl(req.nextUrl.origin));
}
