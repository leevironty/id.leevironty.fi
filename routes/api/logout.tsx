import { define } from "@/lib/utils.ts";
import { endSession } from "@/lib/session.ts"


export const handler = define.handlers({
  POST(ctx) {
    const headers = endSession(ctx.req.headers);
    return Response.json({ok: true}, {headers: headers})
  },
});
