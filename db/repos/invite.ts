import db from '../client.ts';
import * as models from '../models.ts';
import { now, listObjs } from './util.ts';
import { createToken, hashToken} from '@utils';


export function createInvitation(user_id: number, valid_for_minutes: number): string {
  const token = createToken(32);
  db.prepare(`
    INSERT INTO registration_tokens(user_id, token_hash, created_at, valid_until)
    VALUES (?, ?, ?, ?)
  `).run(user_id, hashToken(token), now(), now(valid_for_minutes * 60))
  return token
}

export function isValid(invite_token: string): boolean {
  const invite_token_hash = hashToken(invite_token);
  const response = db.prepare(`
    SELECT 1
    JOIN registration_tokens
    WHERE registration_tokens.token_hash = ?
    AND registration_tokens.valid_until >= ?;
  `).all(invite_token_hash, now());
  if (response.length > 1) {
    throw new Error('Logic error! Should not have multiple same token hashes.');
  }
  return response.length === 1
}

export function getInvitedUser(invite_token: string) {
  const invite_token_hash = hashToken(invite_token);
  // TODO: could UTC & precision be enforced -> always proper date string comparisons?
  const response = db.prepare(`
    SELECT users.*
    FROM users
    JOIN registration_tokens
    ON users.id = registration_tokens.user_id
    WHERE registration_tokens.token_hash = ?
    AND registration_tokens.valid_until >= ?;
  `).all(invite_token_hash, now());
  const users = response.map(obj => models.UserSchema.parse(obj))
  if (users.length > 1) {
    throw new Error('Logic error! Should not find many users for a given invite token.');
  }
  if (users.length === 0) {
    console.log('Found no valid invite tokens with hash ', invite_token_hash)
    return null
  }
  return users[0]
}

export const listInvites = listObjs(models.RegistrationTokenSchema, 'registration_tokens');
