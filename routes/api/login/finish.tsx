import { createToken, define } from "@/lib/utils.ts";
import {
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

import { getCookies, setCookie } from "@std/http/cookie";
import { getLoginChallenge } from "@/db/repos/challenge.ts";
import { getCredentials, updateCredential } from "@/db/repos/credentials.ts";
import { b64ToUint8Array } from "@/lib/utils.ts";
import config from "@/config.ts";
import z from "zod";
import { createSessionHeader } from "@/lib/session.ts";


const idAndUserHandle = z.object({
  id: z.string(),
  response: z.object({
    userHandle: z.string().nullable(),
  })
});



export const handler = define.handlers({
  async POST(ctx) {
    const authenticationResponse = await ctx.req.json();

    const id_and_handle = idAndUserHandle.parse(authenticationResponse);
    if (id_and_handle.response.userHandle === null) {
      return Response.json({error: 'must provide user handle'}, {status: 400})
    }
    const cookies = getCookies(ctx.req.headers);
    const login_token = cookies[config.cookieName.login];
    if (login_token === undefined) {
      return Response.json({error: 'login cookie missing'}, {status: 400})
    }
    const login_challenge = getLoginChallenge(login_token);
    if (login_challenge === null) {
      return Response.json({error: 'login token is invalid'}, {status: 400})
    }

    console.log(authenticationResponse)

    const credentials = getCredentials(id_and_handle.id, id_and_handle.response.userHandle)
    if (credentials === null) {
      return Response.json({error: 'credential not found'}, {status: 400})
    }

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: login_challenge,
      expectedOrigin: config.expectedOrigin,
      expectedRPID: config.domain,
      credential: {
        id: credentials.credential_id,
        publicKey: b64ToUint8Array(credentials.public_key),
        counter: credentials.counter,
        transports: JSON.parse(credentials.transports),
      },
    });
    // TODO: what happens when authentication fails?
    updateCredential(credentials.id, verification.authenticationInfo.newCounter)
    console.log(verification)
    if (!verification.verified) {
      return Response.json({error: 'verification failed'}, {status: 400})
    }

    const headers = createSessionHeader(credentials.user_id)
    return Response.json({ok: true}, {headers: headers})
  },
});
