// DEBUG ends
import { program } from 'commander';

// import * as repo from './server/repository.ts';
import * as user from '@repos/user.ts';
import * as invite from '@repos/invite.ts';
import * as challenge from '@repos/challenge.ts';
import * as credential from '@repos/credentials.ts'
import { now } from "@repos/util.ts";



const createUser = (username: string, displayname: string) => {
  console.log(`Creating user ${username}`);
  const user_id = user.createUser(username, displayname);
  console.log(`Created user id ${user_id}`);
}

const createRegistrationToken = (user_id: string) => {
  const token = invite.createInvitation(Number(user_id), 60);
  console.log(`Register at http://localhost:8000/register/${token}`)
}

// Seed the database for testing
// createUser('leevi', 'Leevi Rönty')


const userCommand = program.command('user');
const debugCommand = program.command('debug');
program.command('now').action(() => console.log(now()));
// const serveCommand = program.command('serve')

// const serve = () => {
// import { } from './server/server.ts';
// }

userCommand.command('create <username> <displayname>').action(createUser)
userCommand.command('get-token <user_id>').action(createRegistrationToken)
userCommand.command('list').action(() => console.log(user.listUsers()))

debugCommand.action(() => {
  const users = user.listUsers()
  const registrationChallenges = challenge.listRegistrationChallenges()
  const loginChallenges = challenge.listLoginChallenges()
  // const challenges = repo.listChallenges()
  const invites = invite.listInvites()
  const credentials = credential.listCredentials()
  // const sessions = repo.listSessions()

  console.log({
    users,
    registrationChallenges,
    loginChallenges,
    invites,
    credentials,
    // sessions,
  })
})

program.parse()
