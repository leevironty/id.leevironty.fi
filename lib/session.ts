import { createToken } from "@/lib/utils.ts";
import { createSession, getSession, removeSession, getSessionUser } from "@/db/repos/session.ts";
import { getCookies, setCookie } from "@std/http/cookie";
import config from "@/config.ts";


export function createSessionHeader(user_id: number, session_duration_hours?: number) {
  const headers = new Headers()
  const session_token = createToken(32);
  setCookie(headers, {
    name: config.cookieName.session,
    value: session_token,
    domain: config.parentDomain,
    path: '/',
    httpOnly: true,
    sameSite: 'Lax'
  })
  const hours = session_duration_hours ?? config.sessionDurationDefault;
  createSession(user_id, session_token, 60 * hours);
  return headers
}

export function endSession(headers: Headers) {
  const new_headers = new Headers()
  const cookies = getCookies(headers);
  const session_token = cookies[config.cookieName.session]
  if (session_token !== undefined) {
    removeSession(session_token)
  }
  setCookie(new_headers, {
    name: config.cookieName.session,
    value: '',
    maxAge: 0,
    domain: config.parentDomain,
    path: '/',
    httpOnly: true,
    sameSite: 'Lax'
  })
  return new_headers
}


export function authenticatedUser(headers: Headers) {
  const cookies = getCookies(headers);
  const session_token = cookies[config.cookieName.session]
  if (session_token === undefined) {
    return null
  }
  return getSessionUser(session_token)
}

export function currentSession(headers: Headers) {
  const cookies = getCookies(headers);
  const session_token = cookies[config.cookieName.session]
  if (session_token === undefined) {
    return null
  }
  return getSession(session_token)
}