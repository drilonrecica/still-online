// Kayla, days 2–5: the Brianna saga. The hoodie, the sleepover, the twist, an awkward peace.
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const kaylaDays: Contact['days'] = {
  2: { status: 'online', personalMessage: '~*some ppl r SO original*~ (not)' },
  3: { status: 'busy', personalMessage: '~*not invited and NOT crying*~' },
  4: {
    status: 'online',
    personalMessage: '~*waiting 4 the universe to explain itself*~',
  },
  5: { status: 'online', personalMessage: '~*sleepover survivor*~' },
};

export const kaylaDayScripts: readonly Script[] = [
  {
    id: 'day2',
    trigger: { type: 'onDay', day: 2 },
    start: 'hoodie',
    nodes: {
      hoodie: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'code red', delayMs: 1000 },
          { text: 'brianna wore the striped hoodie today', delayMs: 1200 },
          { text: 'THE striped hoodie. MY striped hoodie', delayMs: 1100 },
          {
            text: 'we walked into homeroom at the same time. like TWINS',
            delayMs: 1300,
          },
          { delayMs: 600, personalMessageChange: '~*copycat alert*~' },
        ],
        choices: [
          {
            text: 'omg did anyone notice??',
            label: 'Did ppl notice?',
            next: 'notice',
          },
          {
            text: 'maybe its just a popular hoodie',
            label: 'Popular hoodie?',
            next: 'popular',
          },
          {
            text: g('lol twinsies', 'lol twins'),
            label: g('Twinsies', 'Twins'),
            next: 'twins',
          },
        ],
      },
      notice: {
        lines: [
          { text: 'EVERYONE noticed', delayMs: 1000 },
          { text: 'mr dalton asked if we planned it', delayMs: 1200 },
          { text: 'in front of the WHOLE bio class', delayMs: 1000 },
        ],
        choices: [
          { text: 'what did u say?', next: 'said' },
          { text: 'what did SHE say?', next: 'said' },
        ],
      },
      popular: {
        lines: [
          {
            text: '{name}. there were 2 at the whole mall. i checked',
            delayMs: 1300,
          },
          { text: 'she KNEW', delayMs: 900 },
        ],
        choices: [
          { text: 'ok thats suspicious', label: 'Suspicious', next: 'said' },
          { text: 'did u talk to her?', next: 'said' },
        ],
      },
      twins: {
        lines: [
          { text: 'NOT FUNNY', delayMs: 900 },
          { text: '...ok a little funny', delayMs: 1500 },
          { text: 'NO. not funny', delayMs: 900 },
          { delayMs: 600, personalMessageChange: '~*i am NOBODYS twin*~' },
        ],
        choices: [
          { text: 'sorry sorry. what happened', next: 'said' },
          {
            text: 'it was a LITTLE funny',
            label: 'A little funny',
            next: 'said',
          },
        ],
      },
      said: {
        lines: [
          { text: 'i said "nice hoodie"', delayMs: 1200 },
          { text: 'she said "u too"', delayMs: 1000 },
          { text: 'U TOO. like its HERS', delayMs: 900 },
          {
            text: 'tmrw im wearing something she could NEVER copy',
            delayMs: 1300,
          },
          {
            delayMs: 800,
            personalMessageChange: '~*one of a kind. unlike SOME ppl*~',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day3',
    trigger: { type: 'onDay', day: 3 },
    start: 'invite',
    nodes: {
      invite: {
        lines: [
          { text: '{name} r u there', delayMs: 4000 },
          {
            text: g(
              'so brianna is having a sleepover',
              'so brianna is having a bday party. and a sleepover after',
            ),
            delayMs: 1200,
          },
          {
            text: g(
              'everyone in our grade got invited',
              'everyone in our grade got invited. u boys just to the party part',
            ),
            delayMs: 1100,
          },
          { text: 'EVERYONE', delayMs: 800 },
          { text: 'guess who didnt', delayMs: 1300 },
        ],
        choices: [
          { text: 'oh no kayla :(', label: 'Oh no :(', next: 'fine' },
          {
            text: 'maybe it got lost?',
            label: 'Maybe it got lost?',
            next: 'lost',
          },
        ],
      },
      fine: {
        lines: [
          { text: 'its fine. im FINE', delayMs: 1100 },
          { delayMs: 500, personalMessageChange: '~*FINE*~' },
          {
            text: g(
              'theyre doing face masks and scary movies. i HATE fun',
              'u guys get cake and then they do scary movies all night. i HATE fun',
            ),
            delayMs: 1400,
          },
        ],
        choices: [
          {
            text: g('we can have our own sleepover!!', 'movie night at mine!!'),
            label: g('Our own sleepover', 'Movie night'),
            next: 'own',
          },
          {
            text: 'its ok to be upset u know',
            label: 'Its ok to be upset',
            next: 'upset',
          },
        ],
      },
      lost: {
        lines: [
          { text: 'lost WHERE {name}', delayMs: 1000 },
          { text: 'she handed out pink envelopes in homeroom', delayMs: 1200 },
          { text: 'nobody loses a PINK envelope', delayMs: 1000 },
        ],
        choices: [
          {
            text: g(
              'then we have our own sleepover. a better one',
              'then come to movie night at mine. a better one',
            ),
            label: g('Our own sleepover', 'Movie night'),
            next: 'own',
          },
          {
            text: 'that really sucks. im sorry',
            label: 'Im sorry',
            next: 'upset',
          },
        ],
      },
      own: {
        lines: [
          { text: 'omg yes', delayMs: 900 },
          {
            text: g(
              'a COUNTER sleepover. but better',
              'a COUNTER movie night. but better',
            ),
            delayMs: 1100,
          },
          {
            text: g(
              'we will have 2 kinds of ice cream',
              'we will have 2 kinds of pizza',
            ),
            delayMs: 1000,
          },
          { text: 'thats one more than brianna probably', delayMs: 1100 },
          {
            delayMs: 800,
            personalMessageChange: g(
              '~*sleepovers r 4 REAL friends*~ (L)',
              '~*movie nights r 4 REAL friends*~ (Y)',
            ),
          },
        ],
        end: true,
      },
      upset: {
        lines: [
          { text: '...', delayMs: 2000 },
          { text: 'ok i am a little upset', delayMs: 1200 },
          { text: 'thx {name}. dont tell anyone i said that', delayMs: 1300 },
          {
            delayMs: 800,
            personalMessageChange: '~*some days r just grey*~ :(',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day4',
    trigger: { type: 'onDay', day: 4 },
    start: 'sit',
    nodes: {
      sit: {
        lines: [
          { text: '{name}. sit down', delayMs: 4000 },
          { text: 'brianna IMed me', delayMs: 1200 },
          { text: 'she asked why i never answered her email', delayMs: 1300 },
          { text: 'so i checked. it was in my deleted stuff', delayMs: 1300 },
          {
            text: 'i delete everything from brianna without reading it. its a policy',
            delayMs: 1400,
          },
        ],
        choices: [
          { text: 'kayla.', label: 'Kayla.', next: 'email' },
          {
            text: 'what did it say??',
            label: 'What did it say?',
            next: 'email',
          },
        ],
      },
      email: {
        lines: [
          { text: 'it was the sleepover invite', delayMs: 1200 },
          { text: 'from like 2 weeks ago', delayMs: 1000 },
          { text: 'it said "i hope u come!! :)" with a SMILEY', delayMs: 1300 },
          { text: '{name} i think brianna is... nice??', delayMs: 1500 },
          { delayMs: 600, personalMessageChange: '~*plot twist*~ :O' },
        ],
        choices: [
          {
            text: 'what about the away message tho',
            label: 'The away message?',
            next: 'sister',
          },
          { text: 'told u it wasnt about u', label: 'Told u', next: 'told' },
        ],
      },
      sister: {
        lines: [
          { text: 'I ASKED', delayMs: 900 },
          { text: 'it was about her little sister', delayMs: 1200 },
          {
            text: 'her sister copies everything. her hair. her songs. her pm',
            delayMs: 1400,
          },
          {
            text: 'and she got the hoodie bc she thought MINE looked cool',
            delayMs: 1400,
          },
        ],
        choices: [
          { text: 'so shes a fan lol', label: 'Shes a fan', next: 'go' },
          {
            text: g(
              'awww thats kinda sweet',
              'ha ok thats actually kinda nice',
            ),
            label: g('Kinda sweet', 'Kinda nice'),
            next: 'go',
          },
        ],
      },
      told: {
        lines: [
          { text: 'u did NOT tell me that', delayMs: 1000 },
          { text: '...ok maybe u did. a little', delayMs: 1300 },
          {
            text: 'it was about her little sister. who copies EVERYTHING',
            delayMs: 1400,
          },
        ],
        choices: [
          {
            text: 'see. not everything is about u',
            label: 'Not about u',
            next: 'go',
          },
          {
            text: g(
              'so r u going to the sleepover?',
              'so r u going? im going to the party part anyway',
            ),
            label: 'Going?',
            next: 'go',
          },
        ],
      },
      go: {
        lines: [
          {
            text: g(
              'the sleepover is tmrw. and im invited. technically',
              'the party is tmrw. and the sleepover. and im invited. technically',
            ),
            delayMs: 1400,
          },
          {
            text: g(
              'do i go?? after EVERYTHING??',
              'ur going to the party part right?? do i go?? after EVERYTHING??',
            ),
            delayMs: 1100,
          },
        ],
        choices: [
          {
            text: g('GO. obviously', 'GO. ill be there for the cake part'),
            label: 'Go!',
            next: 'going',
          },
          { text: 'only if u want to', label: 'If u want to', next: 'want' },
        ],
      },
      going: {
        lines: [
          { text: 'ok. ok im going', delayMs: 1100 },
          { text: 'im bringing ice cream. as a peace offering', delayMs: 1300 },
          {
            delayMs: 800,
            personalMessageChange: '~*entering enemy territory*~ (sort of)',
          },
        ],
        end: true,
      },
      want: {
        lines: [
          { text: 'i DO want to', delayMs: 1300 },
          { text: 'i think', delayMs: 1200 },
          { text: 'ugh feelings r so confusing', delayMs: 1100 },
          {
            delayMs: 800,
            personalMessageChange: '~*confused but optimistic*~',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day5',
    trigger: { type: 'onDay', day: 5 },
    start: 'survived',
    nodes: {
      survived: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'i survived', delayMs: 1200 },
          {
            text: g(
              'the sleepover',
              'the sleepover. u boys left after the cake. LUCKY',
            ),
            delayMs: 1000,
          },
        ],
        choices: [
          { text: 'HOW WAS IT', label: 'How was it??', next: 'how' },
          { text: 'did u guys fight??', label: 'Did u fight?', next: 'fight' },
        ],
      },
      how: {
        lines: [
          { text: 'it was... fine??', delayMs: 1300 },
          { text: 'we both brought the SAME ice cream', delayMs: 1200 },
          { text: 'mint chip. both of us. we just stared', delayMs: 1300 },
        ],
        choices: [
          { text: 'LOL twins again', label: 'Twins again', next: 'laugh' },
          { text: 'great minds!', next: 'laugh' },
        ],
      },
      fight: {
        lines: [
          { text: 'no!! we were very polite', delayMs: 1200 },
          { text: 'TOO polite', delayMs: 900 },
          { text: 'we said "oh sorry" like 40 times', delayMs: 1200 },
        ],
        choices: [
          {
            text: 'that sounds so awkward',
            label: 'So awkward',
            next: 'laugh',
          },
          { text: 'polite is a start!', label: 'Its a start', next: 'laugh' },
        ],
      },
      laugh: {
        lines: [
          {
            text: g(
              'then she said "cute pajamas"',
              'then she asked about u. she said ur "kinda funny"',
            ),
            delayMs: 1300,
          },
          {
            text: g('and i said "u too"', 'and i said "he IS. sometimes"'),
            delayMs: 1100,
          },
          { text: 'and then we LAUGHED. like actually laughed', delayMs: 1300 },
          {
            text: 'were not best friends. were like... peace treaty friends',
            delayMs: 1500,
          },
        ],
        choices: [
          { text: 'im proud of u kayla', label: 'Proud of u', next: 'proud' },
          { text: 'so the war is over?', label: 'War over?', next: 'over' },
        ],
      },
      proud: {
        lines: [
          { text: 'stop ur gonna make me cry', delayMs: 1200 },
          { text: 'ok i AM crying. drama princess things', delayMs: 1400 },
          {
            text: g(
              'here. feelings. dont make it weird',
              'here. hearts. theyre for ME. i earned them',
            ),
            delayMs: 1000,
            wink: 'hearts',
          },
          { delayMs: 800, personalMessageChange: '~*peace (kind of)*~ <3' },
        ],
        end: true,
      },
      over: {
        lines: [
          { text: 'the war is over', delayMs: 1100 },
          { text: 'but if she copies my new haircut its ON', delayMs: 1300 },
          { text: 'jk', delayMs: 1200 },
          { text: '...mostly jk', delayMs: 1500 },
          {
            delayMs: 800,
            personalMessageChange: '~*peace treaty signed*~ (Y)',
          },
        ],
        end: true,
      },
    },
  },
];
