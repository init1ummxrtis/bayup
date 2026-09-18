/**
 * We don't have licensed cover art for third-party games, so each game gets a
 * distinct abstract gradient treatment instead of scraped box art.
 */
export const GAME_GRADIENTS: Record<string, string> = {
  valorant: "linear-gradient(135deg, #ff4655 0%, #1f0a12 100%)",
  "apex-legends": "linear-gradient(135deg, #d9424b 0%, #2b1810 55%, #d68a2b 100%)",
  "dota-2": "linear-gradient(135deg, #7b1113 0%, #1a0f0f 60%, #c0392b 100%)",
  "genshin-impact": "linear-gradient(135deg, #4fb3bf 0%, #2a2f6b 55%, #f2c14e 100%)",
  "zenless-zone-zero": "linear-gradient(135deg, #f2e94e 0%, #1a1a1f 55%, #ff5da2 100%)",
};

export function gameGradient(slug: string): string {
  return GAME_GRADIENTS[slug] ?? "linear-gradient(135deg, #7c5cff 0%, #16181f 100%)";
}
