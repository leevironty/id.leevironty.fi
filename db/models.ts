import * as z from "zod";

export const UserSchema = z.object({
  id: z.int(),
  subject: z.string(),
  username: z.string(),
  displayname: z.string(),
  created_at: z.coerce.date(),
});

/**
 * Challenge schema.
 * @param token_hash is the hashed challenge session token. The challenge
 * session token (not hashed) is returned along with the challenge when
 * the registration / authentication flow starts.
 * @param challenge is a random string that must be signed by the passkey.
 * @param created_at time when the challenge was created.
 * @param valid_until time after which the challenge should be rejected. Time delta
 * between created_at and valid_until should be on the order of one minute.
 */
export const ChallengeSchema = z.object({
  id: z.int(),
  token_hash: z.string(),
  challenge: z.string(),
  created_at: z.coerce.date(),
  valid_until: z.coerce.date(),
});

export const InviteChallengeSchema = z.object({
  id: z.int(),
  user_id: z.int(),
  webauthn_user_id: z.string(),
  token_hash: z.string(),
  challenge: z.string(),
  created_at: z.coerce.date(),
  valid_until: z.coerce.date(),
});

/**
 * Invitation token for assigning a new passkey credential to the user.
 *
 * Token should be removed once new credentials have been created with it.
 */
export const RegistrationTokenSchema = z.object({
  id: z.int(),
  user_id: z.int(),
  token_hash: z.string(),
  created_at: z.coerce.date(),
  valid_until: z.coerce.date(),
});

/**
 * Logged in session.
 *
 * Repeated calls to the introspection endpoint can extend the validity of the
 * session. When (valid_until - now) < log_out_after, set a new valid_until
 * = now + log_out_after + small time delta. The small time delta helps prevent
 * db writes multiple times per second when the token is introspected.
 */
export const SessionSchema = z.object({
  id: z.int(),
  user_id: z.int(),
  token_hash: z.string(),
  created_at: z.coerce.date(),
  valid_until: z.coerce.date().nullable(),
  log_out_after: z.int(),
});

/**
 * Schema for the credentials
 * @param user_id links to the users table, not returned by the passkey.
 * @param credential_id is the identifier of the passkey. Is part of the response.
 * @param webauthn_user_id is the identity of the user as seen by the passkey.
 * @param counter is returned by some passkeys. The library may or may not use this
 * for validation depending on the device.
 */
export const CredentialSchema = z.object({
  id: z.int(),
  user_id: z.int(),
  credential_id: z.string(),
  webauthn_user_id: z.string(),
  public_key: z.string(), // TODO: maybe should be a blob?
  counter: z.int(),
  transports: z.string(),
  created_at: z.coerce.date(),
  last_used: z.coerce.date(),
});

export const DB_INIT_STATEMENT = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  subject TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  displayname TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY,
  token_hash TEXT NOT NULL,
  challenge TEXT NOT NULL,
  created_at TEXT NOT NULL,
  valid_until TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invite_challenges (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  webauthn_user_id TEXT NOT NULL, -- add not null here back
  token_hash TEXT NOT NULL,
  challenge TEXT NOT NULL,
  created_at TEXT NOT NULL,
  valid_until TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS registration_tokens (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  valid_until TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credentials (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  webauthn_user_id TEXT NOT NULL,
  credential_id TEXT NOT NULL,
  public_key BLOB NOT NULL,
  counter INTEGER NOT NULL,
  transports TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  log_out_after INTEGER NOT NULL
);

-- CREATE TABLE IF NOT EXIST token (
--   id INTEGER PRIMARY KEY,
--   token_hash TEXT NOT NULL,
--   created_at TEXT NOT NULL,
--   valid_until TEXT NOT NULL,
-- );
-- 
-- CREATE TABLE IF NOT EXIST session (
--   token_id INTEGER PRIMARY KEY REFERENCES token(id),
--   user_id INTEGER REFERENCES user(id),
--   log_out_after TEXT NOT NULL
-- );
-- 
-- CREATE TABLE IF NOT EXISTS challenge (
--   token_id INTEGER PRIMARY KEY REFERENCES token(id),
--   challenge TEXT NOT NULL
-- );
-- 
-- CREATE TABLE IF NOT EXISTS invite_challenge (
--   token_id INTEGER PRIMARY KEY REFERENCES token(id),
--   challenge TEXT NOT NULL,
--   user_webauthn_id TEXT NOT NULL,
--   user_id INTEGER REFERENCES user(id)
-- );
`;
