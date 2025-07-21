// DEBUG ends
import { program } from 'commander';

// import * as repo from './server/repository.ts';
import * as user from '@/db/repos/user.ts';
import * as invite from '@/db/repos/invite.ts';
import * as challenge from '@/db/repos/challenge.ts';
import * as credential from '@/db/repos/credentials.ts';
import * as session from "@/db/repos/session.ts";
import { now } from "@/db/repos/util.ts";
import config from "@/config.ts";



const createUser = (username: string, displayname: string) => {
  console.log(`Creating user ${username}`);
  const user_id = user.createUser(username, displayname);
  console.log(`Created user id ${user_id}`);
}

const createInvite = (username: string, valid_for_minutes: string | undefined) => {
  console.log({username, valid_for_minutes})
  const minutes = Number(valid_for_minutes ?? 60);
  const maybeUser = user.getUserByUsername(username)
  if (maybeUser === null) {
    console.log(`User ${username} does not exist!`)
    return
  }
  const token = invite.createInvitation(Number(maybeUser.id), minutes);
  console.log(`Register at ${config.expectedOrigin}/register/${token}`)
}

// Seed the database for testing
// createUser('leevi', 'Leevi Rönty')


const userCommand = program.command('user');
const inviteCommand = program.command('invite');
const debugCommand = program.command('debug');
program.command('now').action(() => console.log(now()));
// const serveCommand = program.command('serve')

// const serve = () => {
// import { } from './server/server.ts';
// }

userCommand.command('create <username> <displayname>').action(createUser)
userCommand.command('list').action(() => console.log(user.listUsers()))

inviteCommand.command('create <username> [valid_for_minutes]').action(createInvite)
// userCommand.command('get-token <user_id>').action(createRegistrationToken)

debugCommand.action(() => {
  const users = user.listUsers()
  const registrationChallenges = challenge.listRegistrationChallenges()
  const loginChallenges = challenge.listLoginChallenges()
  // const challenges = repo.listChallenges()
  const invites = invite.listInvites()
  const credentials = credential.listCredentials()
  const sessions = session.listSessions()

  console.log({
    users,
    registrationChallenges,
    loginChallenges,
    invites,
    credentials,
    sessions,
  })
})

program.parse()
