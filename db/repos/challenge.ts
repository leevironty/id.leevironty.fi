import { hash } from "node:crypto";
import db from '../client.ts';
import * as models from '../models.ts';
import { now, listObjs } from './util.ts';
import { createToken, hashToken} from '@/lib/utils.ts';


export function createRegistrationChallenge(user_id: number, webauthn_user_id: string, token: string, challenge: string, valid_for_seconds: number) {
  const token_hash = hashToken(token);
  db.prepare(`
    INSERT INTO invite_challenges(
      user_id, webauthn_user_id, token_hash, challenge, created_at, valid_until
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `).run(user_id, webauthn_user_id, token_hash, challenge, now(), now(valid_for_seconds));
}

export function createLoginChallenge(challenge: string, token: string, valid_for_seconds: number) {
  const token_hash = hashToken(token);
  db.prepare(`
    INSERT INTO challenges(token_hash, challenge, created_at, valid_until)
    VALUES (?, ?, ?, ?);
  `).run(token_hash, challenge, now(), now(valid_for_seconds));
}

export function getRegistrationChallenge(challenge_token: string) {
  const challenge_token_hash = hashToken(challenge_token);
  const result = db.prepare(`
    DELETE FROM invite_challenges
    WHERE
      token_hash = ?
      AND valid_until >= ?
    RETURNING challenge, user_id, webauthn_user_id;
  `).get(challenge_token_hash, now());
  if (result === undefined) {
    return null
  }
  return models.InviteChallengeSchema.pick({challenge: true, user_id: true, webauthn_user_id: true}).parse(result)
}

export function getLoginChallenge(challenge_token: string) {
  const challenge_token_hash = hashToken(challenge_token);
  const result = db.prepare(`
    DELETE FROM challenges
    WHERE
      token_hash = ?
      AND valid_until >= ?
    RETURNING challenge;
  `).get(challenge_token_hash, now());
  if (result === undefined) {
    return null
  }
  return models.ChallengeSchema.pick({challenge: true}).parse(result).challenge
}

export const listRegistrationChallenges = listObjs(models.InviteChallengeSchema, 'invite_challenges');
export const listLoginChallenges = listObjs(models.ChallengeSchema, 'challenges');
