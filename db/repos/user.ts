import { createToken } from "@/lib/utils.ts";
import db from '../client.ts';
import * as models from '../models.ts';
import { now, listObjs } from './util.ts';

export function createUser(username: string, displayname: string): number {
  const subject = createToken(32);
  const response = db.prepare(`
    INSERT INTO users(username, displayname, created_at, subject)
    VALUES (?, ?, ?, ?) RETURNING id;
  `).get(username, displayname, now(), subject);

  const user = models.UserSchema.pick({ id: true }).parse(response);
  return user.id;
}

export const listUsers = listObjs(models.UserSchema, 'users');

export function removeUser(user_id: number): boolean {
  const result = db.prepare(`DELETE FROM users WHERE id = ?;`).run(user_id);
  return result.changes === 1;
}

export function getUserByUsername(username: string) {
  const result = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (result === undefined) {
    return null
  }
  return models.UserSchema.parse(result)
}
