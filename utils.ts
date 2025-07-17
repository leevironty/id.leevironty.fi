import { randomBytes, hash } from 'node:crypto';
import { createDefine } from "fresh";

// deno-lint-ignore no-empty-interface
export interface State {}

export const define = createDefine<State>();

export function hashToken(token: string): string {
  return hash('sha256', token)
}

export function createToken(bytes: number) {
  const random_bytes = randomBytes(bytes)
  return random_bytes.toString('hex')
}

export function uint8arrayToB64(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data));
}

export function b64ToUint8Array(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
