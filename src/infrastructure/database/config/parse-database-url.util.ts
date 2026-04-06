/**
 * Heroku / Neon / RDS expõem `DATABASE_URL`; TypeORM aqui usa host/user/pass separados.
 */
export type ParsedDatabaseUrl = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export function parseDatabaseUrl(raw: string | undefined): ParsedDatabaseUrl | null {
  const s = raw?.trim();
  if (!s) return null;
  try {
    const normalized = /^postgres(ql)?:\/\//i.test(s)
      ? s
      : `postgresql://${s}`;
    const u = new URL(normalized);
    const database = u.pathname.replace(/^\//, '').split('?')[0];
    if (!database) return null;
    return {
      host: u.hostname,
      port: Number(u.port || 5432),
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database,
    };
  } catch {
    return null;
  }
}

/** SSL típico em Postgres gerido (Heroku, AWS RDS, etc.). */
export function inferPostgresSslFromUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('amazonaws.com') ||
    lower.includes('heroku') ||
    lower.includes('neon.tech') ||
    lower.includes('sslmode=require') ||
    lower.includes('ssl=true')
  );
}

export function isLocalPostgresHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}
