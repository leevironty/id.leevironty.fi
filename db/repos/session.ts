import { hash } from "node:crypto";
import db from '../client.ts';
import * as models from '../models.ts';
import { now, listObjs } from './util.ts';
import { createToken, hashToken} from '@/lib/utils.ts';
import z from "zod";
import { denoPlugin } from "jsr:@deno/esbuild-plugin@^1.1.1";


const TIME_OFFSET_SECONDS = 30


export function createSession(user_id: number, session_token: string, log_out_after_minutes: number) {
  const session_token_hash = hashToken(session_token);
  db.prepare(`
    INSERT INTO sessions(user_id, token_hash, created_at, valid_until, log_out_after)
    VALUES (?, ?, ?, ?, ?);
  `).run(user_id, session_token_hash, now(), now(60 * log_out_after_minutes + TIME_OFFSET_SECONDS), log_out_after_minutes)
}

export function getSessionUser(session_token: string) {
  const session_token_hash = hashToken(session_token);
  const raw_session = db.prepare(`
    SELECT *
    FROM sessions
    WHERE token_hash = ?
    AND (valid_until >= ? OR valid_until IS NULL);
  `).get(session_token_hash, now());
  if (raw_session === undefined) {
    return null
  }
  const session = models.SessionSchema.parse(raw_session)
  const raw_user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(session.user_id);
  const user = models.UserSchema.parse(raw_user);
  
  // update valid_until if within log_out_after minutes of expiration
  const min_valid_until = new Date(Date.now() + 1000 * 60 * session.log_out_after)
  if (session.valid_until !== null && min_valid_until > session.valid_until) {
    const new_valid_until = now(60 * session.log_out_after + TIME_OFFSET_SECONDS)
    db.prepare(`UPDATE sessions SET valid_until = ? WHERE id = ?`).run(new_valid_until, session.id);
  }

  return user
}

export function removeSession(session_token: string) {
  const session_token_hash = hashToken(session_token)
  db.prepare(`DELETE FROM sessions WHERE token_hash = ?;`).run(session_token_hash);
}

export const listSessions = listObjs(models.SessionSchema, 'sessions')
// export function 