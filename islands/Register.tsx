import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { startRegistration, RegistrationResponseJSON } from '@simplewebauthn/browser';

interface RegisterProps {
  username: string;
  displayname: string
}


const handleRegisterFlow = async () => {
  console.log('About to register...')
  const registrationOptions = await (await fetch('/api/register/start')).json();
  let registrationResponse: RegistrationResponseJSON;
  try {
    registrationResponse = await startRegistration({optionsJSON: registrationOptions});
  } catch (error) {
    console.log('Cancelled?', error)
    return
  }

  const verification = await fetch('/api/register/finish', {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(registrationResponse)
  })
  // console.log(verification)
  // console.log('to be continued')
  // TODO: notify user of errors in case verification is not ok
}

export default function Register(props: RegisterProps) {
  return (
    <div class="flex gap-8 py-6">
      <p>Welcome, {props.displayname}!</p>
      <p>About to create a passkey with the username {props.username}.</p>
      <Button onClick={handleRegisterFlow}>Create Passkey</Button>
    </div>
  );
}
