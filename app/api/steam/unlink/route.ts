import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }

  try {
    await sql`DELETE FROM steam_owned_games WHERE user_id = ${userId}`;

    await sql`
      UPDATE library_entries
      SET ownership_verified = FALSE, verified_at = NULL, updated_at = now()
      WHERE user_id = ${userId} AND ownership_verified = TRUE
    `;

    await sql`
      UPDATE users
      SET steam_id = NULL, steam_linked_at = NULL, steam_synced_at = NULL
      WHERE id = ${userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("STEAM UNLINK ERROR:", error);
    return NextResponse.json(
      { error: "Deconectarea contului Steam a esuat." },
      { status: 500 }
    );
  }
}
