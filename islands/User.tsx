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
    <div class="flex flex-col justify-center items-center p-4 min-h-screen">
      <div class="bg-white rounded-md flex flex-col items-center justify-between w-full max-w-[25rem]">
        <h1 class="text-3xl font-bold mt-5 mb-1">Leevi-ID</h1>
        <p>Logged in as "{props.displayname}"</p>
        <p>Sessions</p>
        <div>
          {props.sessions.map((session, idx) => <p key={idx}>{idx}: {session.created_at.toISOString()}</p>)}
        </div>
        <button
          type="button"
          class="bg-gray-900 active:bg-gray-700 border-2 border-transparent active:border-gray-800 hover:bg-gray-800 text-white py-1 px-4 rounded-md inline-block font-medium text-lg mb-5 mt-5"
          onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}
