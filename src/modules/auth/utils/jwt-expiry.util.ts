export function jwtExpiryToSeconds(expiresIn: string): number {
  const trimmed = expiresIn.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  const match = /^(\d+)([smhd])$/i.exec(trimmed);
  if (!match) {
    return 86400;
  }
  const n = Number(match[1]);
  const u = match[2].toLowerCase();
  switch (u) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 86400;
    default:
      return 86400;
  }
}
