import { define } from "@/lib/utils.ts";
import { getCookies } from "@std/http/cookie";
import { getRegistrationChallenge } from "@/db/repos/challenge.ts";
import { invalidateUserInvites } from "@/db/repos/invite.ts"
import { createCredentials } from "@/db/repos/credentials.ts";
import config from "@/config.ts";
import { uint8arrayToB64 } from "@/lib/utils.ts";


import {
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { createSessionHeader } from "@/lib/session.ts";

export const handler = define.handlers({
  async POST(ctx) {
    console.log('in register/finish')
    const cookies = getCookies(ctx.req.headers);

    const registration_token = cookies[config.cookieName.registration];
    if (registration_token === undefined) {
      return Response.json({error: 'registration cookie missing'}, {status: 400});
    }

    const registration_challenge = getRegistrationChallenge(registration_token);

    if (registration_challenge === null) {
      return Response.json({error: 'registration token is invalid'}, {status: 400});
    }
    const registration_response = await ctx.req.json();
    const verification = await verifyRegistrationResponse({
      response: registration_response,
      expectedChallenge: registration_challenge.challenge,
      expectedOrigin: config.expectedOrigin,
      expectedRPID: config.domain,
    })
    console.log(verification);
    if (!verification.verified || verification.registrationInfo === undefined) {
      return Response.json({error: 'verification failed'}, {status: 400})
    }
    invalidateUserInvites(registration_challenge.user_id)

    const { credential } = verification.registrationInfo;

    createCredentials({
      user_id: registration_challenge.user_id,
      webauthn_user_id: registration_challenge.webauthn_user_id,
      credential_id: credential.id,
      public_key: uint8arrayToB64(credential.publicKey),
      counter: credential.counter,
      transports: JSON.stringify(credential.transports || []),
    })

    const headers = createSessionHeader(registration_challenge.user_id)
    return Response.json({ok: true}, {headers: headers})
  },
});
