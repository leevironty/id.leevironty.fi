import { define } from "@/lib/utils.ts";
import Login from "@/islands/Login.tsx";
import User from "@/islands/User.tsx";


import { authenticatedUser, currentSession } from "@/lib/session.ts";
import { getUserSessions } from "@/db/repos/session.ts";
import config from "@/config.ts"


export const handler = define.handlers({
  async GET(ctx) {
    const user = authenticatedUser(ctx.req.headers);
    let inner;
    if (user === null) {
      inner = <Login/>
    } else {
      const redirect = ctx.url.searchParams.get('redirect');
      if (redirect) {
        const target = new URL(redirect);
        const isSecure = target.protocol === 'https' || config.domain === 'localhost'
        const isSameTLD = target.hostname.endsWith(`.${config.domain}`) || target.hostname === config.domain
        if (isSecure && isSameTLD) {
          return Response.redirect(target, 302)
        } else {
          return Response.redirect('/', 302)
        }
      }
      const current_session = currentSession(ctx.req.headers);
      const sessions = getUserSessions(user.id);
      const passed_sessions = sessions.map(s => ({
        created_at: s.created_at,
        is_current_session: s.id === (current_session?.id ?? -1),
        log_out_after: s.log_out_after,
        valid_until: s.valid_until,
      }));
      inner  = <User displayname={user.displayname} sessions={passed_sessions} credentials={[]}/>
    }
    return ctx.render(inner);
  }
})
