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


interface Credential {
  created_at: Date;
  last_used: Date;
}

interface Session {
  created_at: Date;
  log_out_after: number;
  valid_until: Date | null;
  is_current_session: boolean;
}

interface UserProps {
  displayname: string;
  sessions: Session[];
  credentials: Credential[];
}


async function handleLogout() {
  await fetch('/api/logout', {method: 'POST'});
  location.reload();
}


export default function User(props: UserProps) {
  return (
    <div>
      <p>Logged in as {props.displayname}</p>
      <p>Sessions</p>
      <div>
        {props.sessions.map((session, idx) => <p key={idx}>{idx}: {session.created_at.toISOString()}</p>)}
      </div>
      <Button onClick={handleLogout}>Log out</Button>
    </div>
  );
}
