import { startAuthentication } from '@simplewebauthn/browser';

const handleLoginFlow = async () => {
  const authenticationOptions = await (await fetch('/api/login/start')).json();
  const authenticationResponse = await startAuthentication({
    optionsJSON: authenticationOptions
  });
  const verification = await fetch('/api/login/finish', {
    body: JSON.stringify(authenticationResponse),
    headers: {"Content-Type": "application/json"},
    method: 'POST',
  });
  if (verification.ok) {
    location.reload();
  }
}

export default () => {
  return (
    <div class="flex flex-col justify-center items-center p-4 min-h-screen">
      <div class="bg-white rounded-md flex flex-col items-center justify-between w-full max-w-[25rem]">
        <h1 class="text-3xl font-bold mt-5 mb-1">Leevi-ID</h1>
        <p>Sign in to id.leevironty.fi</p>
        <button
          type="button"
          onClick={handleLoginFlow}
          class="bg-gray-900 active:bg-gray-700 border-2 border-transparent active:border-gray-800 hover:bg-gray-800 text-white py-1 px-4 rounded-md inline-block font-medium text-lg mb-5 mt-5"
        >Authenticate</button>
      </div>
    </div>
  );
}
