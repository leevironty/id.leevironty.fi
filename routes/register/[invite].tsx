import { define } from "@/lib/utils.ts";
import Register from "@/islands/Register.tsx"

import { getInvitedUser } from "@/db/repos/invite.ts";

import { setCookie, Cookie } from "@std/http/cookie"
import config from '@/config.ts';


function InvalidInvite(){
  return (
    <p>Invite is not valid! Maybe it expired?</p>
  )
}


export const handler = define.handlers({
  async GET(ctx) {
    const invite_token = ctx.params.invite
    const user = getInvitedUser(invite_token);

    if (user === null) {
      return ctx.render(<InvalidInvite/>, {status: 400})
    }
    const headers = new Headers()
    const cookie: Cookie = {
      name: config.cookieName.invite,
      value: invite_token,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24,
    }
    setCookie(headers, cookie)

    return ctx.render(<Register username={user.username} displayname={user.displayname}/>, {headers: headers})
  }
})


