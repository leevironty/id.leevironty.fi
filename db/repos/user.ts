import db from '../client.ts';
import * as models from '../models.ts';
import { now, listObjs } from './util.ts';

export function createUser(username: string, displayname: string): number {
  const response = db.prepare(`
    INSERT INTO users(username, displayname, created_at)
    VALUES (?, ?, ?) RETURNING id;
  `).get(username, displayname, now());

  const user = models.UserSchema.pick({ id: true }).parse(response);
  return user.id;
}

export const listUsers = listObjs(models.UserSchema, 'users');

export function removeUser(user_id: number): boolean {
  const result = db.prepare(`DELETE FROM users WHERE id = ?;`).run(user_id);
  return result.changes === 1;
}
