// Jess, days 6–10: after the concert. The purple forehead, the fan art contest, Lakeview sells
// out, 2nd place, and the pick at the rec hall (docs/story-week2.md → Jess).
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const jessWeek2Days: Contact['days'] = {
  6: {
    status: 'online',
    personalMessage: 'ZIGGY TOUCHED THIS (its over my bed now)',
  },
  7: { status: 'online', personalMessage: 'FAN ART CONTEST!!!!! (i WILL win)' },
  8: { status: 'busy', personalMessage: 'LAKEVIEW SOLD OUT!!!!!!!!! :(' },
  9: {
    status: 'online',
    personalMessage: `2ND PLACE!!!!! signed setlist ${g('(L)', '(Y)')}`,
  },
  10: { status: 'online', personalMessage: 'rec hall 2nite!!! SIGN: READY' },
};

export const jessWeek2Scripts: readonly Script[] = [
  {
    id: 'day6',
    trigger: { type: 'onDay', day: 6 },
    start: 'bruise',
    nodes: {
      bruise: {
        lines: [
          { text: '{name}!!!!', delayMs: 2000, nudge: true },
          { text: 'FOREHEAD UPDATE', delayMs: 500 },
          { text: 'its PURPLE now. like grape soda purple', delayMs: 800 },
          {
            text: 'my brother says its a star if u squint. I SQUINT A LOT NOW',
            delayMs: 1000,
          },
        ],
        choices: [
          { text: 'is ur forehead ok??', label: 'Ur forehead ok?', next: 'ok' },
          {
            text: g('frame it!!', 'dude. battle scar'),
            label: g('Frame it!', 'Battle scar'),
            next: 'scar',
          },
          { text: 'did ur mom freak', label: 'Did ur mom freak?', next: 'mom' },
        ],
      },
      ok: {
        lines: [
          { text: 'its FINE. it only hurts when i touch it', delayMs: 800 },
          { text: 'so i touch it like every 5 min', delayMs: 700 },
          { text: 'to CHECK', delayMs: 500 },
        ],
        choices: [
          { text: 'stop touching it lol', next: 'wall' },
          { text: 'thats not how healing works', next: 'wall' },
        ],
      },
      scar: {
        lines: [
          {
            text: g(
              'FRAME MY FACE?? lol {name}',
              'BATTLE SCAR. YES. thats what its called now',
            ),
            delayMs: 700,
            nudge: true,
          },
          {
            text: g(
              'ok i cant frame my face. but i DID frame something',
              'i got it in BATTLE. the battle of the drumstick',
            ),
            delayMs: 900,
          },
        ],
        choices: [
          { text: 'what else??', label: 'What else?', next: 'wall' },
          { text: 'tell me everything', next: 'wall' },
        ],
      },
      mom: {
        lines: [
          {
            text: 'she asked why i have a purple forehead AND a drumstick',
            delayMs: 900,
          },
          { text: 'i said "rock and roll mom"', delayMs: 700 },
          { text: 'she said "go to bed jessica"', delayMs: 800 },
          { text: 'it was 4 in the afternoon', delayMs: 700 },
        ],
        choices: [
          { text: 'LOL jessica', next: 'wall' },
          { text: 'fair tho', next: 'wall' },
        ],
      },
      wall: {
        lines: [
          { text: 'ok BIG NEWS', delayMs: 900 },
          { text: 'the drumstick MOVED', delayMs: 600 },
          {
            text: 'it was under my pillow but i rolled on it. OW. again',
            delayMs: 900,
          },
          { text: 'so now its on 2 nails over my bed', delayMs: 800 },
          { text: 'with a label. ZIGGY TOUCHED THIS', delayMs: 700 },
          {
            delayMs: 1500,
            personalMessageChange: 'forehead: purple. heart: ZIGGY',
          },
        ],
        choices: [
          { text: 'its a shrine!!', label: 'A shrine!', next: 'museum' },
          {
            text: g('its perfect (L)', 'respect. \\m/'),
            label: g('Its perfect', 'Respect'),
            next: 'museum',
          },
        ],
      },
      museum: {
        lines: [
          { text: 'its not a shrine. its a MUSEUM', delayMs: 800 },
          { text: 'tours r free. for u', delayMs: 700 },
          {
            text: g(
              'everyone else pays in glitter (L)',
              'everyone else pays (Y)',
            ),
            delayMs: 800,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day7',
    trigger: { type: 'onDay', day: 7 },
    start: 'contest',
    nodes: {
      contest: {
        lines: [
          { text: '{name} {name}', delayMs: 2000, nudge: true },
          { text: 'CONTEST. ON THE FAN SITE', delayMs: 500 },
          { text: 'FAN ART. theme: "the comets in space"', delayMs: 800 },
          { text: 'and its due TMRW', delayMs: 600 },
        ],
        choices: [
          {
            text: 'what r u making??',
            label: 'What r u making?',
            next: 'plan',
          },
          { text: 'tmrw?? thats so soon', label: 'So soon!', next: 'soon' },
        ],
      },
      soon: {
        lines: [
          { text: 'I KNOW. i work best under pressure', delayMs: 800 },
          { text: 'and under glitter', delayMs: 600 },
          {
            text: 'the plan: a collage. ziggys drumstick spin. IN SPACE',
            delayMs: 900,
          },
        ],
        choices: [
          { text: 'use the ticket stub!', label: 'Ticket stub!', next: 'stub' },
          {
            text: g(
              'glitter = u win. more stars. more glitter',
              'it needs flames. space flames',
            ),
            label: g('Glitter = u win', 'Flames'),
            next: 'extra',
          },
        ],
      },
      plan: {
        lines: [
          { text: 'a COLLAGE', delayMs: 700 },
          { text: 'ziggys drumstick spin. IN SPACE', delayMs: 700 },
          {
            text: 'magazine stars. tinfoil. and the drumstick is the main character obviously',
            delayMs: 1000,
          },
        ],
        choices: [
          { text: 'use the ticket stub!', label: 'Ticket stub!', next: 'stub' },
          {
            text: g(
              'glitter = u win. more stars. more glitter',
              'it needs flames. space flames',
            ),
            label: g('Glitter = u win', 'Flames'),
            next: 'extra',
          },
        ],
      },
      stub: {
        lines: [
          { text: 'THE TICKET STUB', delayMs: 600, nudge: true },
          { text: 'in the MIDDLE. like a planet', delayMs: 700 },
          { text: 'ur a genius {name}. a GENIUS', delayMs: 700 },
        ],
        choices: [
          { text: 'i know :P', next: 'done' },
          { text: 'its a sacred stub', label: 'Sacred stub', next: 'done' },
        ],
      },
      extra: {
        lines: [
          {
            text: g(
              'MORE. YES. there is no such thing as too much glitter',
              'FLAMES??',
            ),
            delayMs: 700,
          },
          {
            text: g(
              'my cat is wearing some again. its fine. hes used to it',
              '...ok ONE flame. a SMALL one',
            ),
            delayMs: 1000,
          },
          {
            text: g(
              'more stars. more glitter. MORE',
              'in the corner. a tasteful SPACE flame',
            ),
            delayMs: 800,
          },
        ],
        choices: [
          { text: 'ziggy will LOVE it', next: 'done' },
          {
            text: g('perfection', 'flames make everything better'),
            label: g('Perfection', 'Flames r better'),
            next: 'done',
          },
        ],
      },
      done: {
        lines: [
          { text: 'ok its DONE', delayMs: 1200 },
          { text: 'its 40% glitter and 60% LOVE', delayMs: 700 },
          {
            delayMs: 1500,
            personalMessageChange: 'collage: 40% glitter 60% LOVE',
          },
          {
            text: `my mom is mailing it 2nite. wish me luck!!! ${g('(L)', '(Y)')}`,
            delayMs: 800,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day8',
    trigger: { type: 'onDay', day: 8 },
    start: 'sold',
    nodes: {
      sold: {
        lines: [
          { text: '{name}', delayMs: 2000, nudge: true },
          { text: 'LAKEVIEW', delayMs: 600 },
          { text: 'SOLD OUT', delayMs: 600 },
          { text: 'IN 9 MINUTES', delayMs: 600, nudge: true },
          {
            text: 'i was on the phone the WHOLE time. i heard the busy beep 40 times',
            delayMs: 1000,
          },
          { text: 'i am NOT ok', delayMs: 700 },
        ],
        choices: [
          {
            text: g(
              'thered be other shows',
              'the comets will come back. bands always come back',
            ),
            label: g('Other shows', 'They come back'),
            next: 'other',
          },
          {
            text: 'u already caught a DRUMSTICK',
            label: 'U caught a drumstick',
            next: 'drumstick',
          },
          {
            text: 'come to marcos show!',
            label: 'Marcos show!',
            next: 'marco',
          },
        ],
      },
      other: {
        lines: [
          { text: 'OTHER SHOWS', delayMs: 700 },
          { text: 'what if they never come back {name}', delayMs: 800 },
          { text: 'what if they move to SPACE. for real', delayMs: 800 },
        ],
        choices: [
          { text: 'then they play space', next: 'same' },
          { text: 'theyll come back', next: 'same' },
        ],
      },
      drumstick: {
        lines: [
          { text: '...', delayMs: 1200 },
          { text: 'thats true', delayMs: 600 },
          {
            text: 'nobody at lakeview will catch a drumstick w their FACE',
            delayMs: 900,
          },
          { text: 'im one of a kind', delayMs: 600 },
        ],
        choices: [
          { text: 'exactly', next: 'same' },
          {
            text: 'and u have the bruise to prove it',
            label: 'The bruise!',
            next: 'same',
          },
        ],
      },
      marco: {
        lines: [
          { text: 'marcos show??', delayMs: 700 },
          { text: 'the velvet lantern one?? at the rec hall?', delayMs: 800 },
          { text: 'hold on', delayMs: 600 },
        ],
        choices: [
          { text: 'holding', next: 'same' },
          { text: 'what', next: 'same' },
        ],
      },
      same: {
        lines: [
          { text: 'WAIT', delayMs: 900, nudge: true },
          { text: 'lakeview is saturday', delayMs: 600 },
          { text: 'marcos show is saturday', delayMs: 600 },
          { text: 'ITS THE SAME NIGHT', delayMs: 600 },
          { text: 'ok its decided. im going to marcos show', delayMs: 900 },
          {
            delayMs: 1500,
            personalMessageChange: 'in mourning. (velvet lantern tho??)',
          },
          { text: 'which means', delayMs: 700 },
          { text: 'I NEED A NEW SIGN', delayMs: 600, nudge: true },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day9',
    trigger: { type: 'onDay', day: 9 },
    start: 'place',
    nodes: {
      place: {
        lines: [
          { text: '{name}!!!!!', delayMs: 2000, nudge: true },
          { text: '2ND PLACE', delayMs: 500 },
          {
            text: 'I GOT 2ND IN THE FAN ART CONTEST',
            delayMs: 600,
            nudge: true,
          },
          {
            text: 'the prize is the setlist from riverside. SIGNED. by all 4',
            delayMs: 1000,
          },
          { text: 'ziggy signed it TWICE', delayMs: 600 },
          {
            text: '1st was spacegirl4eva. she made a keytar out of MACARONI',
            delayMs: 1000,
          },
          { text: 'I LOST TO PASTA', delayMs: 600 },
        ],
        choices: [
          {
            text: '2nd is amazing!!',
            label: '2nd is amazing',
            next: 'amazing',
          },
          {
            text: g('u were robbed', 'pasta isnt art'),
            label: g('U were robbed', 'Pasta isnt art'),
            next: 'robbed',
          },
          {
            text: 'put it next to the drumstick',
            label: 'Next to the drumstick',
            next: 'drumstick',
          },
        ],
      },
      amazing: {
        lines: [
          { text: 'it IS amazing', delayMs: 700 },
          {
            text: 'i was being dramatic. kayla is rubbing off on me',
            delayMs: 900,
          },
          { text: 'ZIGGYS NAME. TWICE', delayMs: 600 },
        ],
        choices: [
          { text: 'twice!!', next: 'sign' },
          { text: 'whats next', label: 'Whats next?', next: 'sign' },
        ],
      },
      robbed: {
        lines: [
          {
            text: g(
              'ROBBED. by PASTA. thank u {name}',
              'ur not allowed near my glitter. u said FLAMES',
            ),
            delayMs: 800,
          },
          {
            text: g(
              'at least my collage wont go soggy',
              '...but ok. pasta isnt art. thank u',
            ),
            delayMs: 800,
          },
          { text: 'ok im over it. mostly', delayMs: 700 },
        ],
        choices: [
          { text: 'mostly lol', next: 'sign' },
          { text: 'whats next', label: 'Whats next?', next: 'sign' },
        ],
      },
      drumstick: {
        lines: [
          { text: 'ALREADY DID', delayMs: 600 },
          { text: 'drumstick on top. setlist under it', delayMs: 800 },
          { text: 'my wall is getting FAMOUS', delayMs: 700 },
        ],
        choices: [
          { text: 'the museum grows', next: 'sign' },
          { text: 'whats next', label: 'Whats next?', next: 'sign' },
        ],
      },
      sign: {
        lines: [
          { text: 'ok. NEXT PROJECT', delayMs: 900 },
          { text: 'new sign. for the rec hall', delayMs: 700 },
          { text: 'it says: MARCO THROW A PICK', delayMs: 800, nudge: true },
          {
            delayMs: 1500,
            personalMessageChange: 'NEW SIGN: MARCO THROW A PICK',
          },
          { text: 'he HAS to. its in CAPS', delayMs: 700 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day10',
    trigger: { type: 'onDay', day: 10 },
    start: 'threw',
    nodes: {
      threw: {
        lines: [
          { text: '{name}!!!!!!', delayMs: 2000, nudge: true },
          { text: 'HE THREW IT', delayMs: 500 },
          { text: 'MARCO. THREW. A PICK', delayMs: 600, nudge: true },
          {
            text: 'he read my sign and said "no" into the upside down mic',
            delayMs: 1000,
          },
          { text: 'and then in the LAST SONG he just. threw it', delayMs: 900 },
          { text: 'AND I CAUGHT IT', delayMs: 600 },
        ],
        choices: [
          { text: 'with ur HAND??', label: 'With ur hand??', next: 'hand' },
          {
            text: 'did it hit ur forehead lol',
            label: 'Ur forehead lol',
            next: 'forehead',
          },
          {
            text: 'where does it go?',
            label: 'Where does it go?',
            next: 'where',
          },
        ],
      },
      hand: {
        lines: [
          { text: 'W MY HAND', delayMs: 600 },
          { text: 'like a NORMAL person', delayMs: 600 },
          { text: 'i have grown {name}', delayMs: 700 },
        ],
        choices: [
          { text: 'so proud', next: 'shrine' },
          { text: 'character development', next: 'shrine' },
        ],
      },
      forehead: {
        lines: [
          { text: 'NO', delayMs: 600 },
          { text: 'my forehead has RETIRED', delayMs: 700 },
          { text: 'i caught it w my hand. first try', delayMs: 800 },
        ],
        choices: [
          { text: 'a true pro', next: 'shrine' },
          { text: 'the forehead deserves a rest', next: 'shrine' },
        ],
      },
      where: {
        lines: [
          { text: 'WHERE DOES IT GO', delayMs: 700 },
          {
            text: 'next to the drumstick and the setlist. obviously',
            delayMs: 900,
          },
          { text: 'i have a system now', delayMs: 600 },
        ],
        choices: [
          { text: 'a system??', next: 'shrine' },
          { text: 'show me', next: 'shrine' },
        ],
      },
      shrine: {
        lines: [
          { text: 'the drumstick. the setlist. the pick', delayMs: 900 },
          { text: 'its not a museum anymore. its THE SHRINE', delayMs: 800 },
          {
            delayMs: 1500,
            personalMessageChange: 'MARCO THREW A PICK. I CAUGHT IT. W MY HAND',
          },
          { text: 'also the comets played lakeview 2nite', delayMs: 1000 },
          { text: 'I DONT EVEN CARE', delayMs: 600 },
          { text: 'ok a little', delayMs: 1200 },
        ],
        choices: [
          { text: 'only a little', next: 'best' },
          { text: 'the rec hall was better', next: 'best' },
        ],
      },
      best: {
        lines: [
          { text: 'it WAS better. i could see marcos face', delayMs: 900 },
          { text: 'he looked SO annoyed. it was great', delayMs: 800 },
          {
            text: `best week EVER ${g('(L)', '(Y)')}`,
            delayMs: 700,
            nudge: true,
          },
        ],
        end: true,
      },
    },
  },
];
