// Canned answers when the player mails a friend: one per friend, in voice. The second and later
// mails to the same friend get `again`.
import { g } from '../gender';
import type { AutoReply } from './types';

export const autoReplies: readonly AutoReply[] = [
  {
    contactId: 'jess',
    subject: 'RE: ur email!!!',
    body: `omg u actually emailed me!! ok so the concert is the whole reason i am alive rn. ttyl on messenger ok?? ${g('<3', '\\m/')} jess`,
    again: 'ur emailing me AGAIN lol. just msg me on messenger!!',
  },
  {
    contactId: 'pia',
    subject: 'RE: hi',
    body: 'hi!! i read ur email 2 times. my pony says hi too. - pia',
    again: 'u know we can just chat right. i am on messenger. with the ponies.',
  },
  {
    contactId: 'kayla',
    subject: 'RE: omg',
    body: "ok i got ur email and i HAVE SO MUCH to tell u. brianna is literally the worst. msg me later i'll explain everything ~*kayla*~",
    again: `u know u can just chat right?? i'm literally online. whatever. ${g('xoxo', 'later')}`,
  },
  {
    contactId: 'marco',
    subject: 'RE: ',
    body: 'got it. will reply properly when i have time. - marco',
    again: 'dude. messenger. i am right there.',
  },
  {
    contactId: 'theo',
    subject: 'RE: (no subject)',
    body: "Hi. Thanks for the email. I wasn't sure what to say back, so: hi. - Theo",
    again:
      'Um, we can just chat on messenger, right? Not that I mind the emails.',
  },
  {
    contactId: 'dex',
    subject: 'RE: yo',
    body: "yo. email's cool i guess. ride later?",
    again: 'bro just hit me up on messenger lol',
  },
];
