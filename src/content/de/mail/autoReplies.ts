// German canned answers (`src/content/mail/autoReplies.ts`): one per friend, in their German voice
// (docs/localization-de.md → "The six German voices"). Later mails get `again`.
import type { AutoReply } from '../../mail/types';

export const autoReplies: readonly AutoReply[] = [
  {
    contactId: 'jess',
    subject: 'AW: deine mail!!!',
    body: 'OMG du hast mir echt ne MAIL geschrieben!! ok also das konzert is grad der einzige grund warum ich lebe. wir schreiben im messenger ok?? <3 hdgdl jess',
    again: 'du mailst mir SCHON WIEDER lol. schreib mir einfach im messenger!!',
  },
  {
    contactId: 'pia',
    subject: 'AW: hallo',
    body: 'hallo!! ich hab deine mail 2 mal gelesen. mein pony sagt auch hallo. - pia',
    again:
      'du weißt schon dass wir einfach chatten können. ich bin im messenger. mit den ponys.',
  },
  {
    contactId: 'kayla',
    subject: 'AW: omg',
    body: 'ok ich hab deine mail und ich hab dir SO VIEL zu erzählen. brianna is echt das allerletzte *seufz*. schreib mir später, ich erklär dir alles ~*kayla*~',
    again:
      'du weißt schon dass du einfach chatten kannst?? ich bin doch ONLINE. egal. hdl',
  },
  {
    contactId: 'marco',
    subject: 'AW: ',
    body: 'angekommen. antworte richtig, wenn ich zeit hab. - marco',
    again: 'zwerg. messenger. ich bin direkt da.',
  },
  {
    contactId: 'theo',
    subject: 'AW: (kein Betreff)',
    body: 'Hi. Danke für die Mail. Ich wusste nicht genau, was ich zurückschreiben soll, also: hi. - Theo',
    again:
      'Ähm, wir können auch einfach im Messenger schreiben, oder? Nicht, dass mich die Mails stören… sorry.',
  },
  {
    contactId: 'dex',
    subject: 'AW: jo',
    body: 'jo. mail is ok, schätz ich. später skaten?',
    again: 'alter schreib mir einfach im messenger lol',
  },
];
