import { useSignal } from "@preact/signals";
import { define } from "@/lib/utils.ts";
import Counter from "@/islands/Counter.tsx";
import Login from "@/islands/Login.tsx";
import User from "@/islands/User.tsx";

import { authenticatedUser } from "@/lib/session.ts";


export const handler = define.handlers({
  async GET(ctx) {
    const user = authenticatedUser(ctx.req.headers);
    return ctx.render(
      <div class="px-4 py-8 mx-auto fresh-gradient">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        {(user === null) ? <Login/> : <User displayname={user.displayname}/>}
        </div>
      </div>
    )
  }
})
