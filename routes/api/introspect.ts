import { define } from "@/lib/utils.ts";
import { authenticatedUser } from "@/lib/session.ts";


export const handler = define.handlers({
  GET(ctx) {
    const user = authenticatedUser(ctx.req.headers);
    if (user === null) {
      return Response.json({error: 'session missing or invalid'}, {status: 400})
    }
    return Response.json({
      subject: user.subject,
      extra: { displayname: user.displayname }
    })
  },
});
