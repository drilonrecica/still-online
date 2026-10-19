// Pia on Pixlog: bossy little sibling, 23 ponies, tells mom. The pony club opens (day 1), Stardust
// goes missing (2), detective pia suspects Biscuit (3), she's home, extra fluffy (4; the "NEW PICS"
// bulletin), and a present for the player (5). The player is her big sister or brother.
import { g } from '../gender';
import type { PixlogProfile } from './types';

export const piaPixlog: PixlogProfile = {
  contactId: 'pia',
  skin: 'sunset',
  about:
    'this is PIAS pixlog. i have 23 ponies and they all have names. stardust is the QUEEN. ' +
    `${g('my big sister', 'my big brother')} is NOT allowed to look at my pics. ` +
    'ok u can look. but no touching the screen',
  albums: [
    {
      id: 'pia-pony-club',
      day: 1,
      title: 'PIAS PONY CLUB (official pics)',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5311,
            caption: 'the first meeting. i am the boss',
          },
          comments: [
            {
              day: 1,
              from: 'ponyprincess_99',
              text: 'can i join!!! i have the purple one!!!',
            },
            {
              day: 1,
              from: 'pia',
              text: 'u need to ask the boss. i am the boss. ok yes',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5312,
            caption: 'biscuit. security guard. he is bad at it',
          },
          comments: [
            { day: 1, from: 'dex', text: 'he looks like a good guard' },
            { day: 1, from: 'marco', text: 'does the dog get a vote' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5313,
            look: 'long',
            caption: 'me. the president. dad took it',
          },
          comments: [],
        },
        {
          photo: {
            scene: 'party',
            seed: 5314,
            caption: 'stardust in the MIDDLE. where she belongs',
          },
          comments: [
            {
              day: 1,
              from: 'jess',
              text: 'STARDUST IS SO PRETTY!!! i want to join the club!!!',
            },
            {
              day: 2,
              from: 'ponyprincess_99',
              text: 'wait where is she now?? :(',
            },
          ],
        },
      ],
    },
    {
      id: 'pia-stardust-home',
      day: 4,
      title: 'SHE IS HOME!!!',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5321,
            look: 'long',
            caption: 'me + stardust. she is extra fluffy now. (her not me)',
          },
          comments: [
            {
              day: 4,
              from: 'ponyprincess_99',
              text: 'SHE CAME HOME!!! she looks so soft!!!',
            },
            {
              day: 4,
              from: 'kayla',
              text: 'the fluffy hair is a LOOK. stardust is a model now',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5322,
            caption: 'the welcome home party. 22 ponies came. everyone',
          },
          comments: [
            {
              day: 4,
              from: 'theo',
              text: 'um. this is a really nice party. sorry i wasnt invited. i mean its fine',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5323,
            caption: 'biscuit. INNOCENT. he got a sorry treat',
          },
          comments: [
            {
              day: 4,
              from: 'Biscuit',
              text: 'woof. (this is dad. he would like a second sorry treat)',
            },
            { day: 4, from: 'marco', text: 'justice' },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5324,
            caption: 'the case is CLOSED. do NOT ask where i found her',
          },
          comments: [
            { day: 4, from: 'dex', text: 'the laundry right' },
            { day: 4, from: 'pia', text: 'DEX' },
            {
              day: 5,
              from: 'jess',
              text: 'what happened in the laundry pia. WHAT HAPPENED',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'pia-missing',
      day: 2,
      title: 'MISSING!!!',
      body:
        'MISSING: STARDUST. she is purple with silver hair and a star. she is the QUEEN.\n\n' +
        'she was in the middle of the shelf this morning and now SHE ISNT.\n\n' +
        'REWARD: 1 sticker. the good kind. if u took her give her back and i wont tell mom. (i will tell mom)',
    },
    {
      id: 'pia-case-file',
      day: 3,
      title: 'CASE FILE (top secret)',
      body:
        'detective pia is ON THE CASE.\n\n' +
        'suspect #1: biscuit. evidence: he is acting weird. he has a sparkle on his nose. he LOOKED at me.\n\n' +
        `suspect #2: ${g('my big sister', 'my big brother')}. says ${g('she', 'he')} didnt take her. innocent. for now\n\n` +
        'mom said "pia please". that means im right',
    },
    {
      id: 'pia-present',
      day: 5,
      title: 'a PRESENT',
      body:
        'i gave someone a PRESENT. guess who. (L)\n\n' +
        'its a secret how. (dad helped. dont tell dad i said that)\n\n' +
        'if u got a present from me u have to use it FOREVER. or a week. thats the rule',
    },
  ],
  survey: {
    surveyId: 'last-time',
    answers: [
      'when dad tried to do the pony voice',
      'never. i am the one who TELLS',
      'i dont say sorry. i say "ok FINE"',
      'every night. i read pony books under the blanket',
      'dads pudding. it was green. i ate it anyway',
      `the remote. ok not lost. ${g('my sister', 'my brother')} BROKE it`,
      'my birthday. 4 ponies. a RECORD',
      'in the bath. pony songs. the whole album',
      'my ponies have a sleepover EVERY night',
      `NEVER. i tell mom things. ${g('my sister', 'my brother')} tells me things. thats the order`,
    ],
  },
  shouts: [
    { day: 1, text: 'PIAS PONY CLUB IS OPEN. meetings in my room. no running' },
    { day: 1, text: 'DO NOT GO IN MY ROOM (except pony club)' },
    { day: 2, text: 'MISSING: STARDUST. if u see her TELL ME' },
    {
      day: 2,
      text: `${g('my sister', 'my brother')} says ${g('she', 'he')} didnt take her. i believe ${g('her', 'him')}. for now`,
    },
    { day: 3, text: 'detective pia is ON THE CASE' },
    { day: 4, text: 'STARDUST IS HOME (L) extra fluffy' },
    { day: 4, text: 'biscuit got a sorry treat. dont make it a big deal' },
    { day: 5, text: 'i gave someone a PRESENT (L) guess who' },
  ],
  kudosToPlayer: [4, 5],
  guestbook: [
    {
      day: 1,
      from: 'ponyprincess_99',
      text: 'PONY CLUB!!! can i be vice president!!!',
    },
    {
      day: 2,
      from: 'kayla',
      text: 'pia ill look for stardust at the mall. purple w silver hair right? (L)',
    },
    {
      day: 3,
      from: 'Biscuit',
      text: 'woof. (this is dad. biscuit would like his treats back)',
    },
    {
      day: 4,
      from: 'theo',
      text: 'um. im really glad shes home. sorry she was gone',
    },
    {
      day: 5,
      from: 'jess',
      text: 'PIA!!! the pony club needs a SIGN. i have glitter (some)',
    },
  ],
};
