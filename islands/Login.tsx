import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";


import { startAuthentication } from '@simplewebauthn/browser';

const handleLoginFlow = async () => {
  console.log('About to log in...')

  const authenticationOptions = await (await fetch('/api/login/start')).json();
  const authenticationResponse = await startAuthentication({
    optionsJSON: authenticationOptions
  });
  console.log(authenticationResponse);
  const verification = await fetch('/api/login/finish', {
    body: JSON.stringify(authenticationResponse),
    headers: {"Content-Type": "application/json"},
    method: 'POST',
  });
}

export default function Register() {
  return (
    <div class="flex gap-8 py-6">
      <p>Please log in:</p>
      <Button onClick={handleLoginFlow}>Log in with a passkey</Button>
    </div>
  );
}
