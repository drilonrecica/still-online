// Marco, days 6–10: Velvet Lantern plays the rec hall. A poster (not soup), the bucket negotiated
// down to 3 songs, the player's song in the set, a mic that only works upside down, and 83 people
// (docs/story-week2.md → Marco). Lowercase, dry, never "!".
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const marcoWeek2Days: Contact['days'] = {
  6: {
    status: 'online',
    personalMessage: 'the rec hall. for real now. saturday',
  },
  7: { status: 'busy', personalMessage: 'setlist meeting. 3 hours. 8 songs' },
  8: {
    status: 'online',
    personalMessage: 'new song in the set. dont make it weird',
  },
  9: { status: 'busy', personalMessage: 'sound check. pray for us' },
  10: {
    status: 'online',
    personalMessage: 'rec hall tonight. room fits 80. so like 12',
  },
};

export const marcoWeek2Scripts: readonly Script[] = [
  {
    id: 'day6',
    trigger: { type: 'onDay', day: 6 },
    start: 'hall',
    nodes: {
      hall: {
        lines: [
          { text: 'kid', delayMs: 14_000 },
          { text: 'the bean cellar era is over', delayMs: 1300 },
          {
            text: 'velvet lantern plays the rec hall. saturday',
            delayMs: 1400,
          },
          { text: 'for real this time', delayMs: 1100 },
        ],
        choices: [
          {
            text: 'wait. the REC HALL rec hall?',
            label: 'The rec hall?',
            next: 'room',
          },
          {
            text: 'what happened to the first date?',
            label: 'The first date?',
            next: 'bingo',
          },
        ],
      },
      room: {
        lines: [
          { text: 'the real one. next to the pool', delayMs: 1400 },
          { text: 'fits 80. doors at 6. all ages', delayMs: 1300 },
          {
            text: 'all ages means ur mom cant say its a bar',
            delayMs: 1400,
          },
        ],
        choices: [
          { text: '80 people lol', label: '80 people', next: 'poster' },
          { text: 'ok whats the catch', label: 'The catch?', next: 'poster' },
        ],
      },
      bingo: {
        lines: [
          { text: 'bingo took it', delayMs: 1300 },
          { text: 'bingo always wins. bingo has aunts', delayMs: 1400 },
          {
            text: 'so we got the next saturday. fits 80. doors at 6. all ages',
            delayMs: 1600,
          },
        ],
        choices: [
          { text: 'lost to bingo lol', label: 'Lost to bingo', next: 'poster' },
          { text: 'ok whats the catch', label: 'The catch?', next: 'poster' },
        ],
      },
      poster: {
        lines: [
          { text: 'the catch is a poster. a real one', delayMs: 1400 },
          {
            text: 'last time derek drew the lantern. three people asked about soup',
            delayMs: 1700,
          },
          {
            text: 'ur friend with the frog drawings. does he still draw',
            delayMs: 1500,
          },
          { delayMs: 1200, personalMessageChange: 'need: poster. not soup' },
        ],
        choices: [
          { text: 'theo? ill ask him', label: 'Ill ask theo', next: 'theo' },
          {
            text: g('use my flyer again', 'ill do flames again'),
            label: g('My flyer again', 'Flames again'),
            next: 'flyer',
          },
        ],
      },
      theo: {
        lines: [
          { text: 'thats the one', delayMs: 1200 },
          { text: 'tell him its paid. in exposure. and a soda', delayMs: 1500 },
          { text: 'and tell him lantern. not soup', delayMs: 1200 },
          { text: 'later kid', delayMs: 1000 },
        ],
        end: true,
      },
      flyer: {
        lines: [
          {
            text: g(
              'ur flyer was good. for a basement',
              'small flames. tasteful',
            ),
            delayMs: 1400,
          },
          {
            text: 'but this is the rec hall. we need someone who actually draws',
            delayMs: 1600,
          },
          { text: 'ask the frog guy. ill owe u', delayMs: 1200 },
          { text: 'later kid', delayMs: 1000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day7',
    trigger: { type: 'onDay', day: 7 },
    start: 'meeting',
    nodes: {
      meeting: {
        lines: [
          { text: 'kid. u there', delayMs: 15_000 },
          { text: 'setlist meeting. 3 hours so far', delayMs: 1300 },
          { text: '8 songs. we agree on all 8', delayMs: 1300 },
          { text: 'the problem is the bucket', delayMs: 1200 },
          {
            text: 'derek wants to kick the bucket in every song',
            delayMs: 1500,
          },
          {
            text: 'its 2 against 2. ur the tiebreaker. again',
            delayMs: 1400,
          },
        ],
        choices: [
          {
            text: 'every song. the bucket IS the band',
            label: 'Every song',
            next: 'every',
          },
          {
            text: 'only the last one. like the bean cellar',
            label: 'Only the last one',
            next: 'last',
          },
          { text: 'compromise?', label: 'Compromise', next: 'compromise' },
        ],
      },
      every: {
        lines: [
          { text: 'kid', delayMs: 1200 },
          {
            text: 'i read that out loud. derek did a lap of the room',
            delayMs: 1600,
          },
          { text: 'then he said "ok. not EVERY song. 5"', delayMs: 1500 },
        ],
        choices: [
          { text: 'take the deal', label: 'Take the deal', next: 'lawyer' },
          { text: 'counter with 2', label: 'Counter with 2', next: 'lawyer' },
        ],
      },
      last: {
        lines: [
          { text: 'thats what i said', delayMs: 1200 },
          { text: 'derek says the bucket "has range"', delayMs: 1400 },
          { text: 'then he asked for 5. then 4', delayMs: 1300 },
        ],
        choices: [
          { text: 'hold the line', label: 'Hold the line', next: 'lawyer' },
          { text: 'give him 3', label: 'Give him 3', next: 'lawyer' },
        ],
      },
      compromise: {
        lines: [
          { text: 'compromise. with derek', delayMs: 1300 },
          { text: 'ok. i offered 2. he offered 5', delayMs: 1300 },
          { text: 'my roommate offered pizza. nobody took it', delayMs: 1400 },
        ],
        choices: [
          { text: 'meet in the middle', label: 'The middle', next: 'lawyer' },
          { text: 'take the pizza', label: 'Take the pizza', next: 'lawyer' },
        ],
      },
      lawyer: {
        lines: [
          { text: '3 songs. final', delayMs: 1300 },
          {
            text: 'derek negotiated like a lawyer. he had notes',
            delayMs: 1500,
          },
          { text: 'its in writing now. on a napkin', delayMs: 1300 },
          {
            delayMs: 1200,
            personalMessageChange: 'the bucket: 3 songs. negotiated',
          },
          { text: 'ok. back in. 2 more songs to fight about', delayMs: 1400 },
          { text: 'later kid', delayMs: 1000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day8',
    trigger: { type: 'onDay', day: 8 },
    start: 'song',
    nodes: {
      song: {
        lines: [
          { text: 'kid', delayMs: 14_000 },
          { text: 'news. dont make it weird', delayMs: 1200 },
          { text: 'were adding a song to the set', delayMs: 1300 },
          {
            text: g(
              '"lantern heart". ur song. from ur notebook',
              '"56k". ur song. from ur notebook',
            ),
            delayMs: 1500,
          },
          {
            text: 'i said it has potential. it still has potential',
            delayMs: 1400,
          },
          {
            delayMs: 1200,
            personalMessageChange: g(
              'now playing: lantern heart (by my cousin)',
              'now playing: 56k (by my cousin)',
            ),
          },
        ],
        choices: [
          { text: 'NO WAY', label: 'No way', next: 'way' },
          { text: 'which words??', label: 'Which words?', next: 'words' },
          { text: 'do i get credit?', label: 'Credit?', next: 'credit' },
        ],
      },
      way: {
        lines: [
          { text: 'way', delayMs: 1100 },
          {
            text: g(
              'derek likes the chorus. he says "oh oh lantern" is a hook',
              'derek likes the beeeep krrrsh part. he does it on the bucket',
            ),
            delayMs: 1600,
          },
          { text: 'dont tell him i told u he likes something', delayMs: 1300 },
        ],
        choices: [
          { text: 'did u change anything?', label: 'Changes?', next: 'words' },
          {
            text: 'best day of my life',
            label: 'Best day ever',
            next: 'theo',
          },
        ],
      },
      words: {
        lines: [
          { text: 'i changed one word', delayMs: 1300 },
          { text: '...', delayMs: 1500 },
          { text: 'ok four', delayMs: 1100 },
          {
            text: g(
              '"or maybe like a car" is now "or maybe like a star". the car was confusing people',
              '"my sister picked up the phone" is now "my roommate". he really does pick up the phone',
            ),
            delayMs: 1700,
          },
        ],
        choices: [
          { text: 'ok thats better', label: 'Better', next: 'theo' },
          { text: 'thats 4 words??', label: 'Thats 4??', next: 'theo' },
        ],
      },
      credit: {
        lines: [
          { text: 'credit. sure', delayMs: 1200 },
          { text: 'lyrics by my cousin. small letters', delayMs: 1300 },
          { text: 'like the credits in dexs video', delayMs: 1300 },
          { text: 'nobody reads them. but theyre there', delayMs: 1300 },
        ],
        choices: [
          { text: 'bigger letters', label: 'Bigger letters', next: 'theo' },
          { text: 'good enough', label: 'Good enough', next: 'theo' },
        ],
      },
      theo: {
        lines: [
          { text: 'also. theos drafts came', delayMs: 1400 },
          { text: 'he apologised in the subject line', delayMs: 1300 },
          { text: 'both are lanterns. no soup. i like him', delayMs: 1400 },
          { text: 'ok practice. later kid', delayMs: 1100 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day9',
    trigger: { type: 'onDay', day: 9 },
    start: 'check',
    nodes: {
      check: {
        lines: [
          { text: 'kid', delayMs: 16_000 },
          { text: 'sound check at the rec hall. bad news', delayMs: 1400 },
          { text: 'the mic only works upside down', delayMs: 1300 },
          {
            text: 'hold it normal. nothing. flip it. works',
            delayMs: 1400,
          },
        ],
        choices: [
          {
            text: 'just sing upside down',
            label: 'Sing upside down',
            next: 'bat',
          },
          {
            text: 'is it gonna be ok??',
            label: 'Is it gonna be ok?',
            next: 'ok',
          },
        ],
      },
      bat: {
        lines: [
          { text: 'thats the plan', delayMs: 1200 },
          {
            text: 'derek taped it to the stand that way. the good tape',
            delayMs: 1500,
          },
          { text: 'i sing into it like a bat', delayMs: 1200 },
          {
            delayMs: 1200,
            personalMessageChange: 'mic works upside down. so do we',
          },
        ],
        choices: [
          { text: 'very rock', label: 'Very rock', next: 'poster' },
          {
            text: 'can u even see the crowd',
            label: 'See the crowd?',
            next: 'poster',
          },
        ],
      },
      ok: {
        lines: [
          { text: 'probably', delayMs: 1300 },
          {
            text: 'the guy says every mic in the building does that. bingo doesnt care',
            delayMs: 1700,
          },
          {
            text: 'derek taped it to the stand upside down. i sing into it like a bat',
            delayMs: 1600,
          },
          {
            delayMs: 1200,
            personalMessageChange: 'mic works upside down. so do we',
          },
        ],
        choices: [
          { text: 'a bat. very rock', label: 'Very rock', next: 'poster' },
          { text: 'ur gonna be fine', label: 'Ull be fine', next: 'poster' },
        ],
      },
      poster: {
        lines: [
          { text: 'theos poster is up. everywhere', delayMs: 1400 },
          {
            text: 'its good. its a lantern. nobody asked about soup',
            delayMs: 1500,
          },
          {
            text: g(
              'ur on the list. ur mom said yes. 8 rows this time. pick one',
              'ur crew tmrw. load-in at 4. ur mom said yes. to the show too this time',
            ),
            delayMs: 1700,
          },
        ],
        choices: [
          {
            text: g('front row. obviously', 'load-in at 4. got it'),
            label: g('Front row', 'Load-in at 4'),
            next: 'tmrw',
          },
          {
            text: g('the back. like a real fan', 'do i get a shirt'),
            label: g('The back', 'A shirt?'),
            next: 'tmrw',
          },
        ],
      },
      tmrw: {
        lines: [
          { text: 'good', delayMs: 1100 },
          { text: 'tmrw. the rec hall. dont be late', delayMs: 1300 },
          { text: 'the grip tapes open. we go on after', delayMs: 1300 },
          { text: 'later kid', delayMs: 1000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day10',
    trigger: { type: 'onDay', day: 10 },
    start: 'show',
    nodes: {
      show: {
        lines: [
          { text: 'kid', delayMs: 14_000 },
          { text: 'the show happened', delayMs: 1200 },
          { text: '83 people', delayMs: 1300 },
          { text: 'the grip tapes opened. we closed', delayMs: 1300 },
          {
            text: 'the room fits 80. the guy said fire code is a suggestion. his words. again',
            delayMs: 1700,
          },
          {
            delayMs: 1200,
            personalMessageChange: '83 people. i was off by 71',
          },
        ],
        choices: [
          { text: '83!!!', label: '83!!!', next: 'count' },
          { text: 'u threw the pick', label: 'The pick', next: 'pick' },
          {
            text: 'did they like my song?',
            label: 'My song?',
            next: 'song',
          },
        ],
      },
      count: {
        lines: [
          { text: '83', delayMs: 1100 },
          {
            text: 'i counted twice. derek counted three times and got 85',
            delayMs: 1500,
          },
          { text: 'he counted his mom twice', delayMs: 1200 },
        ],
        choices: [
          { text: 'and the pick?', label: 'The pick?', next: 'pick' },
          {
            text: 'did they like my song?',
            label: 'My song?',
            next: 'song',
          },
        ],
      },
      pick: {
        lines: [
          { text: 'jess had a sign. MARCO THROW A PICK', delayMs: 1500 },
          { text: 'i said no. into the upside-down mic', delayMs: 1400 },
          { text: 'then in the last song i threw one', delayMs: 1300 },
          { text: 'dont tell her i aimed', delayMs: 1200 },
        ],
        choices: [
          {
            text: 'ur secret is safe',
            label: 'Secret is safe',
            next: 'bucket',
          },
          {
            text: 'did they like my song?',
            label: 'My song?',
            next: 'song',
          },
        ],
      },
      song: {
        lines: [
          {
            text: g(
              'lantern heart went fine. 83 people sang "oh oh lantern"',
              '56k went fine. derek did the beeeep krrrsh on the bucket. 83 people did it back',
            ),
            delayMs: 1700,
          },
          {
            text: 'the four words stay. lyrics by my cousin. small letters',
            delayMs: 1500,
          },
        ],
        choices: [
          {
            text: 'small letters r fine',
            label: 'Small letters r fine',
            next: 'bucket',
          },
          {
            text: 'and the bucket?',
            label: 'The bucket?',
            next: 'bucket',
          },
        ],
      },
      bucket: {
        lines: [
          { text: 'the bucket was in 3 songs. as negotiated', delayMs: 1400 },
          {
            text: 'derek kicked it over in a 4th. not negotiated',
            delayMs: 1400,
          },
          {
            text: 'mr dalton was the chaperone. after the show he poked the bucket. to check',
            delayMs: 1700,
          },
          { text: '...', delayMs: 1500 },
          { text: 'thanks kid', delayMs: 1200 },
        ],
        end: true,
      },
    },
  },
];
