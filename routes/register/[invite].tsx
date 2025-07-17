import { useSignal } from "@preact/signals";
import { define } from "@/lib/utils.ts";
import { PageProps } from "fresh";
import Counter from "@/islands/Counter.tsx";
import Register from "@/islands/Register.tsx"

import { getInvitedUser } from "@/db/repos/invite.ts";

import { setCookie, Cookie } from "@std/http/cookie"
import config from '@/config.ts';

interface Data {
  name: string;
}

// function Register(props: Data) {
//   // props.req.
//   const count = useSignal(3);
//   return (
//     <div class="px-4 py-8 mx-auto fresh-gradient">
//       <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
//         <img
//           class="my-6"
//           src="/logo.svg"
//           width="128"
//           height="128"
//           alt="the Fresh logo: a sliced lemon dripping with juice"
//         />
//         <h1 class="text-4xl font-bold">Register passkey</h1>
//         <p class="my-4">
//           Time to register, {props.name}
//         </p>

//         <Counter count={count} />
//       </div>
//     </div>
//   );
// };



// function RegisterPage(props: PageProps<Data>) {
//   const count = useSignal(3);
//   return (
//     <div class="px-4 py-8 mx-auto fresh-gradient">
//       <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
//         <img
//           class="my-6"
//           src="/logo.svg"
//           width="128"
//           height="128"
//           alt="the Fresh logo: a sliced lemon dripping with juice"
//         />
//         <h1 class="text-4xl font-bold">Register passkey</h1>
//         <p class="my-4">
//           Time to register, {props.data.name}
//         </p>

//         <Counter count={count} />
//       </div>
//     </div>
//   );
// };


function InvalidInvite(){
  return (
    <p>Invite is not valid! Maybe it expired?</p>
  )
}


export const handler = define.handlers({
  async GET(ctx) {
    // TODO: set invite token as cookie for API requests
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
      // path: '/',
      // secure: true,
    }
    setCookie(headers, cookie)

    return ctx.render(<Register username={user.username} displayname={user.displayname}/>, {headers: headers})
  }
})


