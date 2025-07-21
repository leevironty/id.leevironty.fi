const config = {
  dbPath: Deno.env.get('SQLITE_DB_PATH') ?? "database.db",
  domain: Deno.env.get("DOMAIN") ?? "localhost",
  parentDomain: Deno.env.get("TL_DOMAIN") ?? "localhost",
  rpName: 'Leevi-ID',
  expectedOrigin: Deno.env.get("EXPECTED_ORIGIN") ?? 'http://localhost:8000',
  cookieName: {
    invite: '__Host-invite',
    registration: '__Host-registration',
    login: '__Host-login',
    session: '__Secure-session',
  },
  sessionDurationDefault: 2,
}
console.log('Configuration=', config)
export default config;
