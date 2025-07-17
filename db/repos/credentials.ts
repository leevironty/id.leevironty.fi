import { hash } from "node:crypto";
import db from '../client.ts';
import * as models from '../models.ts';
import { now, listObjs } from './util.ts';
import { createToken, hashToken} from '@utils';
import z from "zod";


const CredentialInput = models.CredentialSchema.omit({id: true, created_at: true, last_used: true});
type CredentialInput = z.infer<typeof CredentialInput>;

export function createCredentials(cred: CredentialInput) {
  db.prepare(`
    INSERT INTO credentials(user_id, webauthn_user_id, credential_id, public_key, counter, transports, created_at, last_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `).run(
    cred.user_id,
    cred.webauthn_user_id,
    cred.credential_id,
    cred.public_key,
    cred.counter,
    cred.transports,
    now(),
    now(),
  );
}

export function getCredentials(credential_id: string, user_handle: string) {
  const result = db.prepare(`
    SELECT * FROM credentials
    WHERE webauthn_user_id = ?
      AND credential_id = ?;
  `).all(user_handle, credential_id);
  const credentials = result.map(cred => models.CredentialSchema.parse(cred));
  if (credentials.length > 1) {
    throw new Error('Duplicate credentials found!')
  }
  if (credentials.length === 0) {
    return null
  }
  return credentials[0]
}

export function updateCredential(id: number, new_counter: number) {
  db.prepare(`
    UPDATE credentials
    SET counter = ?, last_used = ?
    WHERE id = ?
  `).run(new_counter, now(), id);
}

export const listCredentials = listObjs(models.CredentialSchema, 'credentials');
