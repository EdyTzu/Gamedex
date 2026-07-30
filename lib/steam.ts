const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";

export function buildSteamLoginUrl(origin: string) {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": `${origin}/api/steam/callback`,
    "openid.realm": origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

export async function verifySteamCallback(
  searchParams: URLSearchParams
): Promise<string | null> {
  const params = new URLSearchParams(searchParams);
  params.set("openid.mode", "check_authentication");

  const res = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const body = await res.text();
  if (!body.includes("is_valid:true")) {
    return null;
  }

  const claimedId = searchParams.get("openid.claimed_id") ?? "";
  const match = claimedId.match(/\/openid\/id\/(\d{17})$/);

  return match ? match[1] : null;
}

export type SteamOwnedGame = {
  appid: number;
  name: string;
  playtime_forever: number;
};

export async function fetchOwnedGames(
  steamId: string
): Promise<SteamOwnedGame[]> {
  const url = new URL(
    "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
  );
  url.searchParams.set("key", process.env.STEAM_API_KEY!);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "true");
  url.searchParams.set("include_played_free_games", "true");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Steam API a raspuns cu ${res.status}`);
  }

  const data = await res.json();
  return data.response?.games ?? [];
}
