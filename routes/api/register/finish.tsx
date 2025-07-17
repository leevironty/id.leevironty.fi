import { define } from "@utils";
import { getCookies } from "@std/http/cookie";
import { getRegistrationChallenge } from "@repos/challenge.ts";
import { createCredentials } from "@repos/credentials.ts";
import config from "@config";
import { uint8arrayToB64 } from "@utils";

import {
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

export const handler = define.handlers({
  async POST(ctx) {
    console.log('in register/finish')
    const cookies = getCookies(ctx.req.headers);

    const registration_token = cookies['__Host-registration'];
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
    const { credential } = verification.registrationInfo;

    createCredentials({
      user_id: registration_challenge.user_id,
      webauthn_user_id: registration_challenge.webauthn_user_id,
      credential_id: credential.id,
      public_key: uint8arrayToB64(credential.publicKey),
      counter: credential.counter,
      transports: JSON.stringify(credential.transports || []),
    })

    // TODO: redirect to user page?
    // TODO: set session token?
    return Response.json({ok: true})
  },
});
