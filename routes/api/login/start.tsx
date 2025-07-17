import { define } from "@/lib/utils.ts";

import {
  generateAuthenticationOptions,
} from '@simplewebauthn/server';
import config from "@/config.ts";
import { setCookie } from "@std/http/cookie";
import { createToken } from "@/lib/utils.ts";
import { createLoginChallenge, } from "@/db/repos/challenge.ts";


export const handler = define.handlers({
  async GET(_ctx) {
    const login_token = createToken(32);
    const authenticationOptons = await generateAuthenticationOptions({
      rpID: config.domain,
    });
    createLoginChallenge(authenticationOptons.challenge, login_token, 60);
    const headers = new Headers();
    setCookie(headers, {
      name: config.cookieName.login,
      value: login_token,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60,
    })

    return Response.json(authenticationOptons, {headers: headers})
  },
});
