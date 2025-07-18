import { define } from "@/lib/utils.ts";
import { getCookies, Cookie, setCookie } from "@std/http/cookie";
import { getInvitedUser } from "@/db/repos/invite.ts";
import { createRegistrationChallenge } from "@/db/repos/challenge.ts";
import { createToken } from "@/lib/utils.ts";
import {
  generateRegistrationOptions,
} from '@simplewebauthn/server';
import config from "@/config.ts";


export const handler = define.handlers({
  async GET(ctx) {
    console.log('at register/start')
    const cookies = getCookies(ctx.req.headers);
    console.log('cookies: ', cookies)
    const invite = cookies[config.cookieName.invite];
    if (invite === undefined) {
      return Response.json({error: "invite cookie not set"}, {status: 400})
    }

    const user = getInvitedUser(invite);
    if (user === null) {
      return Response.json({error: "invite is not valid"}, {status: 400})
    }

    const registrationOptions = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.domain,
      userName: user.username,
      userDisplayName: user.displayname,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      }
    })
    const registration_challenge_token = createToken(32)

    createRegistrationChallenge(user.id, registrationOptions.user.id ,registration_challenge_token, registrationOptions.challenge, 60)
    const headers = new Headers()
    const cookie: Cookie = {
      name: config.cookieName.registration,
      value: registration_challenge_token,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60,
    }
    setCookie(headers, cookie)
    return Response.json(registrationOptions, {headers: headers})
  },
});
