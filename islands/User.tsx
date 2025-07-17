import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";


// import { startAuthentication } from '@simplewebauthn/browser';

// const handleLoginFlow = async () => {
//   console.log('About to log in...')

//   const authenticationOptions = await (await fetch('/api/login/start')).json();
//   const authenticationResponse = await startAuthentication({
//     optionsJSON: authenticationOptions
//   });
//   console.log(authenticationResponse);
//   const verification = await fetch('/api/login/finish', {
//     body: JSON.stringify(authenticationResponse),
//     headers: {"Content-Type": "application/json"},
//     method: 'POST',
//   });
// }


interface UserProps {
  displayname: string
}


async function handleLogout() {
  await fetch('/api/logout', {method: 'POST'});
  location.reload();
}


export default function User(props: UserProps) {
  return (
    <div>
      <p>Logged in as {props.displayname}</p>
      <Button onClick={handleLogout}>Log out</Button>
    </div>
  );
}
