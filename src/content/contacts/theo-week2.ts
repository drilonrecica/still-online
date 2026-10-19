// Theo, days 6–10: the poster. His drawings on the Room 12 wall, a yes to Marco's poster, two
// drafts, 30 copies and the ask, then the show and the poster as a background
// (docs/story-week2.md → Theo). A girl gets his small crush step, a boy a buddy for the back row.
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const theoWeek2Days: Contact['days'] = {
  6: {
    status: 'online',
    personalMessage: 'mr dalton put my drawings on the wall. sorry',
  },
  7: { status: 'online', personalMessage: 'drawing frogs. normal day' },
  8: { status: 'busy', personalMessage: '2 drafts. sorry' },
  9: {
    status: 'online',
    personalMessage: '30 posters. library printer. 10 cents each',
  },
  10: { status: 'online', personalMessage: 'the posters r EVERYWHERE. sorry' },
};

export const theoWeek2Scripts: readonly Script[] = [
  {
    id: 'day6',
    trigger: { type: 'onDay', day: 6 },
    start: 'wall',
    nodes: {
      wall: {
        lines: [
          { text: 'um hi {name}', delayMs: 5000 },
          { text: 'mr dalton put my cell drawings on the wall', delayMs: 2200 },
          { text: 'the art wall in room 12. by the door', delayMs: 2000 },
          { text: 'so everyone sees them when they come in', delayMs: 2200 },
          { text: 'sorry', delayMs: 1800 },
        ],
        choices: [
          {
            text: 'thats awesome!!',
            label: 'Thats awesome!',
            next: 'awesome',
          },
          { text: 'ur famous now', label: 'Ur famous now', next: 'famous' },
          {
            text: 'dont be sorry, be proud',
            label: 'Be proud',
            next: 'proud',
          },
        ],
      },
      awesome: {
        lines: [
          { text: 'thanks', delayMs: 2200 },
          {
            text: 'people looked at them. like actually stopped',
            delayMs: 2400,
          },
          {
            text: 'an 8th grader pointed at my mitochondria',
            delayMs: 2400,
          },
        ],
        choices: [
          { text: 'see?? awesome', next: 'library' },
          { text: 'the mitochondria deserves it', next: 'library' },
        ],
      },
      famous: {
        lines: [
          { text: 'oh no', delayMs: 2200 },
          { text: 'please dont say famous', delayMs: 2000 },
          {
            text: 'people looked at them and i didnt know where to look',
            delayMs: 2400,
          },
        ],
        choices: [
          { text: 'look at the drawings. like a pro', next: 'library' },
          { text: 'thats what famous feels like', next: 'library' },
        ],
      },
      proud: {
        lines: [
          { text: '...', delayMs: 2500 },
          { text: 'thats what mr dalton said', delayMs: 2000 },
          {
            text: 'i wrote it on an index card. its in my pencil case now',
            delayMs: 2400,
          },
        ],
        choices: [
          { text: 'good. keep it there', next: 'library' },
          { text: 'read it every day', next: 'library' },
        ],
      },
      library: {
        lines: [
          { text: 'so i ate lunch in the library today', delayMs: 2400 },
          {
            text: 'just in case people wanted to talk about them',
            delayMs: 2200,
          },
          {
            text: 'nobody did. the librarian liked the frog on my pencil case tho',
            delayMs: 2600,
          },
          {
            delayMs: 1500,
            personalMessageChange: 'on the wall. (still sorry)',
          },
        ],
        choices: [
          { text: 'next time eat lunch with me', next: 'thanks' },
          {
            text: 'they talk about u in a good way',
            label: 'In a good way',
            next: 'thanks',
          },
        ],
      },
      thanks: {
        lines: [
          { text: g('um', 'thanks man'), delayMs: 3000 },
          {
            text: g(
              'u always say the right thing. sorry',
              'sorry. "man" is weird. thanks',
            ),
            delayMs: 2500,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day7',
    trigger: { type: 'onDay', day: 7 },
    start: 'frogs',
    nodes: {
      frogs: {
        lines: [
          { text: 'hi {name}', delayMs: 5000 },
          { text: 'im drawing frogs. its a normal day', delayMs: 2200 },
          { text: 'this one has a hat', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'nice hat. also marco needs a poster',
            label: 'Nice hat. also...',
            next: 'hat',
          },
          {
            text: 'marco needs a poster for his show. can u draw it?',
            label: 'Marco needs a poster',
            next: 'ask',
          },
        ],
      },
      hat: {
        lines: [
          { text: 'thanks. its a top hat. for frog events', delayMs: 2400 },
          { text: 'wait', delayMs: 1800 },
          { text: 'a poster? for marco? the band marco?', delayMs: 2200 },
        ],
        choices: [
          { text: 'yep. velvet lantern', next: 'ask' },
          { text: 'he asked for u', label: 'He asked for u', next: 'ask' },
        ],
      },
      ask: {
        lines: [
          { text: 'oh', delayMs: 2500 },
          { text: 'a poster. for a real show', delayMs: 2000 },
          { text: 'sorry', delayMs: 1800 },
          { text: 'sorry. i mean. what if its bad', delayMs: 2200 },
          { text: 'sorry. thats 3 sorrys', delayMs: 2200 },
        ],
        choices: [
          { text: 'u can say no', label: 'U can say no', next: 'no' },
          {
            text: g('please theo!!', 'dude ur the only one who can draw'),
            label: g('Please theo!!', 'Only u can draw'),
            next: 'please',
          },
        ],
      },
      no: {
        lines: [
          { text: 'i know', delayMs: 2200 },
          { text: 'thats why i want to say yes', delayMs: 2200 },
          { text: 'i think', delayMs: 1800 },
        ],
        choices: [
          { text: 'then say yes', next: 'yes' },
          { text: 'take ur time', next: 'yes' },
        ],
      },
      please: {
        lines: [
          {
            text: g(
              'nobody ever said please about my drawings before',
              'the only one?? mr dalton has a whole wall of drawings',
            ),
            delayMs: 2400,
          },
          {
            text: g('ok', 'ok. mine r the ones by the door. sorry'),
            delayMs: 2000,
          },
        ],
        choices: [
          { text: 'is that a yes?', next: 'yes' },
          { text: 'he pays in soda probably', next: 'yes' },
        ],
      },
      yes: {
        lines: [
          { text: 'yes', delayMs: 2500 },
          { text: 'tell marco yes', delayMs: 2000 },
          { delayMs: 1500, personalMessageChange: 'drawing a POSTER??' },
          { text: 'what does a band poster even look like', delayMs: 2200 },
          { text: 'does it need the bucket', delayMs: 2200 },
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
          { text: 'hi. sorry. busy', delayMs: 5000 },
          { text: 'i mailed u 2 drafts of the poster', delayMs: 2200 },
          {
            text: 'and marco. i said sorry in the subject line',
            delayMs: 2400,
          },
          { text: 'marco said "lantern. not soup"', delayMs: 2200 },
          { text: 'so theres a lantern on both', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'whats the difference?',
            label: 'Whats the difference?',
            next: 'diff',
          },
          { text: 'u MAILED them? so official', next: 'official' },
        ],
      },
      diff: {
        lines: [
          { text: 'A is a lantern under stars', delayMs: 2200 },
          {
            text: 'B is the same lantern. but theres a tiny bucket in the corner',
            delayMs: 2600,
          },
          { text: 'for derek', delayMs: 1800 },
        ],
        choices: [
          { text: 'A. the stars', label: 'Draft A', next: 'a' },
          { text: 'B. the bucket!!', label: 'Draft B', next: 'b' },
        ],
      },
      official: {
        lines: [
          { text: 'my mom showed me how to attach things', delayMs: 2400 },
          { text: 'it took 40 minutes. sorry', delayMs: 2200 },
          {
            text: 'A is a lantern under stars. B has a tiny bucket in the corner',
            delayMs: 2600,
          },
        ],
        choices: [
          { text: 'A. the stars', label: 'Draft A', next: 'a' },
          { text: 'B. the bucket!!', label: 'Draft B', next: 'b' },
        ],
      },
      a: {
        lines: [
          { text: 'the stars. ok', delayMs: 2200 },
          { text: 'i drew 31 of them. i counted. sorry', delayMs: 2400 },
          {
            delayMs: 1500,
            personalMessageChange: 'draft A. (the lantern stays)',
          },
        ],
        choices: [
          { text: '31 is the perfect number', next: 'lantern' },
          { text: 'its gonna look great', next: 'lantern' },
        ],
      },
      b: {
        lines: [
          { text: 'the bucket. ok :)', delayMs: 2200 },
          {
            text: 'derek will be happy. i think. i dont really know derek',
            delayMs: 2400,
          },
          {
            delayMs: 1500,
            personalMessageChange: 'draft B. (the lantern stays)',
          },
        ],
        choices: [
          { text: 'derek LOVES that bucket', next: 'lantern' },
          { text: 'its gonna look great', next: 'lantern' },
        ],
      },
      lantern: {
        lines: [
          { text: 'ok. ill finish it tonight', delayMs: 2400 },
          { text: 'either way its a lantern', delayMs: 2000 },
          {
            text: 'marco was very clear about the soup',
            delayMs: 2200,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day9',
    trigger: { type: 'onDay', day: 9 },
    start: 'posters',
    nodes: {
      posters: {
        lines: [
          { text: 'um hi {name}', delayMs: 5000 },
          { text: 'the poster is done', delayMs: 2000 },
          {
            text: 'i printed 30. library printer. 10 cents each',
            delayMs: 2400,
          },
          {
            text: 'my mom and i put them up all over school. and at the rec hall',
            delayMs: 2600,
          },
        ],
        choices: [
          {
            text: 'i saw one by the gym!!',
            label: 'I saw one!',
            next: 'saw',
          },
          {
            text: 'u spent 3 dollars on marco??',
            label: '3 dollars??',
            next: 'money',
          },
        ],
      },
      saw: {
        lines: [
          { text: 'oh no. was it straight', delayMs: 2400 },
          { text: 'my mom did the tape. she tapes crooked', delayMs: 2200 },
        ],
        choices: [
          { text: 'it was perfect', next: 'ask' },
          { text: 'a little crooked. its art', next: 'ask' },
        ],
      },
      money: {
        lines: [
          { text: 'its ok. its for the show', delayMs: 2200 },
          {
            text: 'and the librarian gave me the last 2 for free. she likes frogs',
            delayMs: 2600,
          },
        ],
        choices: [
          { text: 'the frog economy', next: 'ask' },
          { text: 'worth it', next: 'ask' },
        ],
      },
      // The ask: the same node for both genders, only the words differ.
      ask: {
        lines: [
          { text: 'um', delayMs: 3000 },
          { text: 'so. saturday', delayMs: 2000 },
          {
            text: g(
              'maybe we could stand near the back. i mean. together. if u want. sorry',
              'can i stand with u? i dont know anyone. marco is kind of scary',
            ),
            delayMs: 3000,
          },
        ],
        choices: [
          {
            text: g('id like that :)', 'obviously dude'),
            label: g('Id like that :)', 'Obviously'),
            next: 'yes',
          },
          {
            text: g('only if u stop saying sorry', 'back row crew'),
            label: g('Stop saying sorry', 'Back row crew'),
            next: 'deal',
          },
        ],
      },
      yes: {
        lines: [
          { text: g(':)', 'ok cool'), delayMs: 2500 },
          {
            text: g(
              'ok. near the back. its a plan',
              'ok. the back. marco cant see us there',
            ),
            delayMs: 2200,
          },
          {
            delayMs: 1500,
            personalMessageChange: 'see u at the show (sorry) (not sorry)',
          },
        ],
        end: true,
      },
      deal: {
        lines: [
          { text: g('ok. no more sorry', 'back row crew. ok'), delayMs: 2500 },
          {
            text: g(
              'sorry. wait. that one doesnt count',
              'is that a real crew? sorry. im in',
            ),
            delayMs: 2400,
          },
          {
            delayMs: 1500,
            personalMessageChange: 'see u at the show (sorry) (not sorry)',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day10',
    trigger: { type: 'onDay', day: 10 },
    start: 'after',
    nodes: {
      after: {
        lines: [
          { text: 'hi {name}', delayMs: 5000 },
          { text: 'that was so loud', delayMs: 2000 },
          {
            text: '83 people. marco said the room fits 80. i counted twice',
            delayMs: 2600,
          },
          {
            text: 'aunt rita took 3 posters home. she said one is for her fridge',
            delayMs: 2600,
          },
        ],
        choices: [
          {
            text: 'ur poster was everywhere!!',
            label: 'Ur poster was everywhere',
            next: 'posters',
          },
          { text: 'did u have fun?', label: 'Did u have fun?', next: 'fun' },
        ],
      },
      posters: {
        lines: [
          { text: 'i know. sorry', delayMs: 2200 },
          { text: 'people took pictures in front of it', delayMs: 2200 },
          { text: 'with flash. i was in one by accident', delayMs: 2400 },
        ],
        choices: [
          { text: 'famous again', next: 'stood' },
          { text: 'ur in a picture!!', next: 'stood' },
        ],
      },
      fun: {
        lines: [
          { text: 'yes', delayMs: 2500 },
          {
            text: 'it was loud and i didnt know the songs. but yes',
            delayMs: 2400,
          },
          { text: 'the bucket ones were my favorite', delayMs: 2200 },
        ],
        choices: [
          { text: 'derek would be proud', next: 'stood' },
          { text: 'same', next: 'stood' },
        ],
      },
      stood: {
        lines: [
          {
            text: g(
              'thanks for standing with me. near the back',
              'thanks for standing w me',
            ),
            delayMs: 2600,
          },
          {
            text: g(
              'it was nice. sorry. not sorry',
              'marco nodded at me. i think thats a lot for him',
            ),
            delayMs: 2600,
          },
        ],
        choices: [
          {
            text: g('it was nice :)', 'thats a LOT for marco'),
            next: 'gift',
          },
          {
            text: g('no sorrys allowed', 'back row crew 4 life'),
            next: 'gift',
          },
        ],
      },
      // Every path passes here once, so the background unlocks once for both genders.
      gift: {
        lines: [
          { text: 'um. also', delayMs: 2500 },
          {
            text: 'i made the poster into a background. pia said she knows how. ur dad helped. sorry',
            delayMs: 3000,
            unlock: 'lantern-poster',
          },
          {
            delayMs: 1500,
            personalMessageChange: 'lantern on ur desktop. ur welcome (sorry)',
          },
        ],
        choices: [
          { text: 'i love it', label: 'I love it', next: 'night' },
          {
            text: 'its already my background',
            label: 'Its already my background',
            next: 'night',
          },
        ],
      },
      night: {
        lines: [
          { text: 'oh. good :)', delayMs: 2500 },
          {
            text: 'ok im going to sleep. my ears r still ringing. sorry',
            delayMs: 2400,
          },
        ],
        end: true,
      },
    },
  },
];
