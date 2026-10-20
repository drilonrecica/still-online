// Kayla, days 6–10: the class rep election vs Brianna. Bangs, the sign-up, the slogan, the 61–61
// tie and the co-reps (docs/story-week2.md → Kayla).
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const kaylaWeek2Days: Contact['days'] = {
  6: { status: 'online', personalMessage: '~*new hair who dis*~' },
  7: { status: 'busy', personalMessage: '~*it is ON*~' },
  8: {
    status: 'online',
    personalMessage: '~*writing a speech. do not disturb*~',
  },
  9: { status: 'busy', personalMessage: '~*vote day. pls hold*~' },
  10: { status: 'online', personalMessage: '~*co-rep*~ (long story)' },
};

export const kaylaWeek2Scripts: readonly Script[] = [
  {
    id: 'day6',
    trigger: { type: 'onDay', day: 6 },
    start: 'bangs',
    nodes: {
      bangs: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'i did it', delayMs: 1200 },
          { text: 'i got BANGS', delayMs: 1000 },
          {
            text: 'my mom cried a little. good crying. i think',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'show me!!', label: 'Show me!', next: 'pic' },
          { text: 'bangs r brave', label: 'Bangs r brave', next: 'brave' },
          {
            text: 'what if brianna copies',
            label: 'What if she copies?',
            next: 'copy',
          },
        ],
      },
      pic: {
        lines: [
          { text: 'ok sending a webcam pic', delayMs: 1200 },
          { text: '...its loading 1 line at a time', delayMs: 2000 },
          { text: 'dial-up is a CRIME', delayMs: 1000 },
          { text: 'ok. there. be honest', delayMs: 1500 },
        ],
        choices: [
          {
            text: g('omg u look so cute', 'they look good. i guess'),
            label: g('So cute!', 'Good i guess'),
            next: 'honest',
          },
          {
            text: 'very ~*dramatic*~',
            label: 'Very dramatic',
            next: 'lifestyle',
          },
        ],
      },
      honest: {
        lines: [
          {
            text: g(
              'THANK U. finally someone gets it',
              'u r such a GUY. but thx',
            ),
            delayMs: 1200,
          },
          {
            text: g(
              'my brother said i look like a sheepdog. he is DEAD to me',
              '"good i guess" is the nicest thing a guy has ever said about my hair',
            ),
            delayMs: 1400,
          },
        ],
        choices: [
          { text: 'lol', next: 'lifestyle' },
          {
            text: 'its a big compliment',
            label: 'Big compliment',
            next: 'lifestyle',
          },
        ],
      },
      brave: {
        lines: [
          { text: 'BRAVE. yes. thats the word', delayMs: 1200 },
          { text: 'bangs r not a haircut {name}', delayMs: 1100 },
          { text: 'bangs r a DECISION', delayMs: 1000 },
        ],
        choices: [
          { text: 'a big decision', next: 'lifestyle' },
          { text: 'u decided well', next: 'lifestyle' },
        ],
      },
      copy: {
        lines: [
          { text: 'then its ON', delayMs: 1100 },
          { text: 'i said it and i meant it', delayMs: 1200 },
          { text: 'peace treaty or NOT', delayMs: 1000 },
        ],
        choices: [
          { text: 'she wouldnt dare', next: 'lifestyle' },
          {
            text: 'kayla its just hair',
            label: 'Its just hair',
            next: 'lifestyle',
          },
        ],
      },
      lifestyle: {
        lines: [
          { text: 'its not just hair. its a lifestyle', delayMs: 1300 },
          { delayMs: 800, personalMessageChange: '~*bangs: a lifestyle*~' },
          { text: 'tmrw is the big reveal at school', delayMs: 1200 },
          {
            text: 'if brianna walks in with bangs i will KNOW',
            delayMs: 1300,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day7',
    trigger: { type: 'onDay', day: 7 },
    start: 'on',
    nodes: {
      on: {
        lines: [
          { text: '{name}. its ON', delayMs: 4000 },
          { text: 'brianna walked into homeroom', delayMs: 1200 },
          { text: 'WITH BANGS', delayMs: 1000 },
          {
            text: 'and then she signed up for class rep. in front of me',
            delayMs: 1400,
          },
          {
            text: 'so i signed up too. with 4 minutes to spare',
            delayMs: 1300,
          },
        ],
        choices: [
          {
            text: 'u should totally win',
            label: 'U should win!',
            next: 'win',
          },
          {
            text: 'maybe shes just a fan again',
            label: 'Shes a fan again?',
            next: 'fan',
          },
          {
            text: 'what about the treaty??',
            label: 'The treaty??',
            next: 'treaty',
          },
        ],
      },
      win: {
        lines: [
          { text: 'i SHOULD win', delayMs: 1100 },
          { text: 'i have ideas. i have bangs. i have u', delayMs: 1300 },
          { text: 'brianna has... also bangs', delayMs: 1200 },
        ],
        choices: [
          { text: 'ur bangs were first', next: 'posters' },
          { text: 'ideas beat bangs', next: 'posters' },
        ],
      },
      fan: {
        lines: [
          { text: 'a FAN', delayMs: 1100 },
          { text: 'fans dont run AGAINST u {name}', delayMs: 1300 },
          { text: '...ok maybe a little bit a fan', delayMs: 1500 },
        ],
        choices: [
          { text: 'a competitive fan', next: 'posters' },
          { text: 'thats kinda flattering', next: 'posters' },
        ],
      },
      treaty: {
        lines: [
          { text: 'the treaty is suspended', delayMs: 1200 },
          { text: 'its called POLITICS', delayMs: 1000 },
          { text: 'look it up', delayMs: 900 },
        ],
        choices: [
          { text: 'politics lol', next: 'posters' },
          { text: 'thats so dramatic', next: 'posters' },
        ],
      },
      posters: {
        lines: [
          {
            text: 'posters r up in the east hallway. go look',
            delayMs: 1300,
          },
          { delayMs: 800, personalMessageChange: '~*kayla 4 class rep*~' },
          { text: 'i made 12. she made 12. i COUNTED', delayMs: 1300 },
          {
            text: g(
              'vote 4 me. tell every1 :)',
              'vote 4 me. and tell the guys (Y)',
            ),
            delayMs: 1100,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day8',
    trigger: { type: 'onDay', day: 8 },
    start: 'drafts',
    nodes: {
      drafts: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'speech emergency', delayMs: 1000 },
          { text: 'i have 11 drafts. they r all BAD', delayMs: 1200 },
        ],
        choices: [
          { text: 'read me one', label: 'Read me one', next: 'slogan' },
          {
            text: 'ur speeches r never bad',
            label: 'Never bad',
            next: 'slogan',
          },
        ],
      },
      slogan: {
        lines: [
          { text: 'ok forget the speech. i need a SLOGAN', delayMs: 1300 },
          { text: 'A: ~*kayla: bangs AND brains*~', delayMs: 1400 },
          {
            text: 'B: a vote 4 kayla is a vote 4 NO MORE MYSTERY LOAF',
            delayMs: 1500,
          },
          { text: 'pick one. be honest', delayMs: 1000 },
        ],
        choices: [
          {
            text: 'A!! bangs AND brains',
            label: 'A: bangs AND brains',
            next: 'a',
          },
          {
            text: g('B. no more loaf', 'the loaf one. every guy votes 4 that'),
            label: g('B: no more loaf', 'The loaf one'),
            next: 'b',
          },
        ],
      },
      a: {
        lines: [
          { text: 'A. i KNEW it', delayMs: 1100 },
          { text: 'its classy. like me', delayMs: 1100 },
          {
            delayMs: 800,
            personalMessageChange: '~*kayla: bangs AND brains*~',
          },
          { text: 'what goes on the poster tho', delayMs: 1200 },
        ],
        choices: [
          {
            text: g('glitter on every K!', 'make the K really big'),
            label: g('Glitter on every K', 'A big K'),
            next: 'done',
          },
          { text: 'ur face. obviously', label: 'Ur face', next: 'done' },
        ],
      },
      b: {
        lines: [
          {
            text: g('the LOAF one?? really??', 'ugh. ur right. its the loaf'),
            delayMs: 1200,
          },
          {
            text: g(
              '...ok its kind of genius. every1 hates the loaf',
              'every1 in our grade has suffered. even the lunch ladies',
            ),
            delayMs: 1400,
          },
          {
            delayMs: 800,
            personalMessageChange:
              'a vote 4 kayla is a vote 4 NO MORE MYSTERY LOAF',
          },
        ],
        choices: [
          { text: 'its a movement', next: 'done' },
          {
            text: 'the loaf has to go',
            label: 'The loaf must go',
            next: 'done',
          },
        ],
      },
      done: {
        lines: [
          { text: 'ok. slogan: DONE', delayMs: 1200 },
          { text: 'i read it to my mirror 3 times', delayMs: 1200 },
          { text: 'the mirror voted 4 me', delayMs: 1100 },
          { text: 'vote day is tmrw. i cant breathe', delayMs: 1300 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day9',
    trigger: { type: 'onDay', day: 9 },
    start: 'tie',
    nodes: {
      tie: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'they counted', delayMs: 1200 },
          { text: '61', delayMs: 1500 },
          { text: 'to 61', delayMs: 1500 },
          {
            text: 'one ballot said "mystery loaf". it doesnt count',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'a TIE??', label: 'A tie??', next: 'shock' },
          { text: 'recount!!', label: 'Recount!', next: 'recount' },
          { text: 'u could share it?', label: 'Share it?', next: 'share' },
        ],
      },
      shock: {
        lines: [
          { text: 'A TIE', delayMs: 1100 },
          { text: 'ive never tied anything in my LIFE', delayMs: 1300 },
          { text: 'except shoes', delayMs: 1500 },
        ],
        choices: [
          { text: 'lol', next: 'office' },
          { text: 'what happens now??', label: 'What now?', next: 'office' },
        ],
      },
      recount: {
        lines: [
          { text: 'they DID recount', delayMs: 1100 },
          { text: 'twice. still 61 to 61', delayMs: 1200 },
          {
            text: 'and the loaf ballot is still the loaf ballot',
            delayMs: 1300,
          },
        ],
        choices: [
          {
            text: 'who votes 4 a LOAF',
            label: 'Who votes 4 a loaf',
            next: 'office',
          },
          { text: 'what happens now??', label: 'What now?', next: 'office' },
        ],
      },
      share: {
        lines: [
          { text: 'SHARE', delayMs: 1100 },
          { text: 'share. with BRIANNA', delayMs: 1300 },
          {
            text: '...dont say that out loud. the universe listens',
            delayMs: 1500,
          },
        ],
        choices: [
          { text: 'too late', next: 'office' },
          { text: 'sorry universe', next: 'office' },
        ],
      },
      office: {
        lines: [
          { text: 'so now we r in the OFFICE', delayMs: 1300 },
          { text: 'me and brianna. on 2 chairs. not talking', delayMs: 1400 },
          { delayMs: 800, personalMessageChange: '~*61 to 61. i cant*~' },
          {
            text: 'dr hargrove decides tmrw. i will be dramatic until then',
            delayMs: 1400,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day10',
    trigger: { type: 'onDay', day: 10 },
    start: 'coreps',
    nodes: {
      coreps: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'plot twist', delayMs: 1200 },
          {
            text: 'dr hargrove made us CO-REPS. me AND brianna',
            delayMs: 1400,
          },
          {
            text: 'and then we went to marcos show. together. dont ask',
            delayMs: 1400,
          },
          {
            text: 'and we were wearing the EXACT same thing. down to the SCRUNCHIE',
            delayMs: 1500,
          },
        ],
        choices: [
          { text: 'co-reps!!', label: 'Co-reps!', next: 'co' },
          {
            text: 'matching AGAIN??',
            label: 'Matching again??',
            next: 'match',
          },
          {
            text: 'so the war is over over?',
            label: 'War over over?',
            next: 'over',
          },
        ],
      },
      co: {
        lines: [
          { text: 'co-reps. its like a rep but 2', delayMs: 1200 },
          { text: 'we agreed on 1 thing already', delayMs: 1100 },
          { text: 'bangs. obviously', delayMs: 1000 },
        ],
        choices: [
          { text: 'thats a good start', next: 'friends' },
          {
            text: 'what about the loaf',
            label: 'And the loaf?',
            next: 'friends',
          },
        ],
      },
      match: {
        lines: [
          { text: 'AGAIN', delayMs: 1000 },
          { text: 'she looked at me. i looked at her', delayMs: 1300 },
          { text: 'she said "u too"', delayMs: 1100 },
        ],
        choices: [
          { text: 'U TOO lol', label: 'U too lol', next: 'friends' },
          { text: 'what did u say', label: 'What did u say?', next: 'friends' },
        ],
      },
      over: {
        lines: [
          { text: 'the war is over over', delayMs: 1200 },
          { text: 'we have meetings now. MEETINGS {name}', delayMs: 1300 },
          {
            text: 'she brings snacks. its hard to hate some1 w snacks',
            delayMs: 1500,
          },
        ],
        choices: [
          { text: 'snacks = peace', next: 'friends' },
          {
            text: 'so ur friends now?',
            label: 'Friends now?',
            next: 'friends',
          },
        ],
      },
      friends: {
        lines: [
          { text: 'were not friends', delayMs: 1300 },
          { text: 'were co-reps', delayMs: 1100 },
          { text: '...', delayMs: 2000 },
          { text: 'ok were friends', delayMs: 1200 },
          { delayMs: 800, personalMessageChange: '~*plot twist*~ (again)' },
          {
            text: g(
              'dont tell her i said that. or do. idk. <3',
              'dont tell her i said that. or do. idk (Y)',
            ),
            delayMs: 1300,
          },
        ],
        end: true,
      },
    },
  },
];
