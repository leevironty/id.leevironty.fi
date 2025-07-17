import { createToken, define } from "@utils";
import {
  verifyAuthenticationResponse,
  AuthenticationResponseJSON
} from '@simplewebauthn/server';

import { getCookies, setCookie } from "@std/http/cookie";
import { getLoginChallenge } from "@repos/challenge.ts";
import { getCredentials, updateCredential } from "@repos/credentials.ts";
import { b64ToUint8Array } from "@utils";
import config from "@config";
import z from "zod";


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
    const login_token = cookies['__Host-login'];
    if (login_token === undefined) {
      return Response.json({error: 'login cookie missing'}, {status: 400})
    }
    const login_challenge = getLoginChallenge(login_token);
    if (login_challenge === null) {
      return Response.json({error: 'login token is invalid'}, {status: 400})
    }

    // const credential_id = typeof authenticationResponse?.id === "string" ? authenticationResponse.id : null

    console.log(authenticationResponse)
    console.log('tbc')

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

    // TODO: generate session token

    const headers = new Headers()
    const session_token = createToken(32);
    // TODO: this may need adjustments for subdomains?
    setCookie(headers, {
      name: '__Host-session',
      value: session_token,
      httpOnly: true,
      sameSite: 'Lax'
    })



    return Response.json({ok: true}, {})
  },
});
