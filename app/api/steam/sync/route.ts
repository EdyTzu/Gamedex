import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchOwnedGames } from "@/lib/steam";
import { sql } from "@/lib/db";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }

  try {
    const rows = await sql`SELECT steam_id FROM users WHERE id = ${userId}`;
    const steamId = rows[0]?.steam_id as string | undefined;

    if (!steamId) {
      return NextResponse.json(
        { error: "Nu ai niciun cont Steam conectat." },
        { status: 400 }
      );
    }

    const games = await fetchOwnedGames(steamId);

    if (games.length === 0) {
      return NextResponse.json(
        {
          error:
            "Steam nu a returnat niciun joc. Verifica daca profilul si detaliile despre jocuri sunt publice.",
        },
        { status: 400 }
      );
    }

    const appids = games.map((game) => game.appid);
    const playtimes = games.map((game) => game.playtime_forever);

    await sql`
      INSERT INTO steam_owned_games (user_id, steam_appid, playtime_minutes, synced_at)
      SELECT ${userId}, appid, playtime, now()
      FROM unnest(${appids}::int[], ${playtimes}::int[]) AS t(appid, playtime)
      ON CONFLICT (user_id, steam_appid) DO UPDATE
        SET playtime_minutes = EXCLUDED.playtime_minutes, synced_at = now()
    `;

    const verified = await sql`
      UPDATE library_entries AS le
      SET ownership_verified = TRUE, verified_at = now(), updated_at = now()
      FROM games AS g
      WHERE le.game_id = g.id
        AND le.user_id = ${userId}
        AND le.ownership_verified = FALSE
        AND g.steam_appid IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM steam_owned_games AS s
          WHERE s.user_id = ${userId} AND s.steam_appid = g.steam_appid
        )
      RETURNING le.id
    `;

    await sql`UPDATE users SET steam_synced_at = now() WHERE id = ${userId}`;

    return NextResponse.json({
      ownedGames: games.length,
      newlyVerified: verified.length,
    });
  } catch (error) {
    console.error("STEAM SYNC ERROR:", error);
    return NextResponse.json(
      { error: "Sincronizarea cu Steam a esuat." },
      { status: 500 }
    );
  }
}
