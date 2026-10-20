// tinfoilcomets.example, days 6–10 (bible §5): CometGirl's marquee, the guestbook (two a day) and
// the fan art contest winners on `/pics` (day 9). The fan art contest is announced on day 7, Lakeview
// sells out on day 8 (the tour's `soldOut`) and is played on day 10, the night of the rec hall show.
import type { GuestbookEntry } from './types';
import type { ConcertPic, DayText } from './tinfoilcomets';

export const TINFOIL_NEWS_WEEK2: readonly DayText[] = [
  {
    day: 6,
    text: 'show review: STILL under construction (its in the newsletter tho)',
  },
  { day: 7, text: 'FAN ART CONTEST!!! theme: the comets in space. due TMRW' },
  { day: 8, text: 'LAKEVIEW: SOLD OUT in 9 MIN. i did not get tickets. AGAIN' },
  { day: 8, text: 'contest: 14 entries!!! i am judging all night' },
  { day: 9, text: 'CONTEST WINNERS!!! see pics' },
  { day: 10, text: 'lakeview was TONIGHT. i listened on the radio' },
  { day: 10, text: 'buzz lost his hat in the wind. i would have caught it' },
];

/** The three winning fan art entries, photographed at home (not concert pics). */
export const TINFOIL_PICS_WEEK2: readonly ConcertPic[] = [
  {
    day: 9,
    seed: 7109,
    scene: 'livingroom',
    caption: '1ST!!! the macaroni keytar by spacegirl4eva (24 keys. i counted)',
  },
  {
    day: 9,
    seed: 7110,
    scene: 'party',
    caption:
      '2ND!!! the glitter collage by jess (ziggys drumstick spin. IN SPACE)',
  },
  {
    day: 9,
    seed: 7111,
    scene: 'classroom',
    caption: '3RD!!! kevin the robot by robot_cover_guy (he beeps)',
  },
];

export const TINFOIL_GUESTBOOK_WEEK2: readonly GuestbookEntry[] = [
  {
    day: 6,
    name: 'pia (L) ponies (L)',
    message:
      'UR HAMSTERS R CUTE. i am getting one (maybe). i am writing why i need one. it has 3 pages',
  },
  {
    day: 6,
    name: 'dave_k',
    message: 'ur counter went up again. i think its me. i keep checking it',
  },
  {
    day: 7,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'ENTERING!!! GLITTER COLLAGE. ZIGGY WILL SEE IT. (HE WONT BUT HE WILL IN MY HEART)',
  },
  {
    day: 7,
    name: 'spacegirl4eva',
    message: 'entering 2. thats all i will say. get a fork',
  },
  {
    day: 8,
    name: 'ticketless_tina',
    message:
      '9 MINUTES. i had the phone in my hand. i will trade my gel pens AND my sister',
  },
  {
    day: 8,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'SOLD OUT. I AM WEARING BLACK. (MY SOCKS ARE GLITTER BUT THE REST IS BLACK.) IT IS THE SAME NIGHT AS MY FRIENDS SHOW SO I AM GOING TO THAT. BUT I AM STILL SAD. IN ALL CAPS',
  },
  {
    day: 9,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      '2ND!!! I LOST TO PASTA AND IM OK. A SIGNED SETLIST!!! ZIGGY WROTE HIS NAME TWICE. THE DRUMSTICK HAS A FRIEND NOW (L)',
  },
  {
    day: 9,
    name: 'robot_cover_guy',
    message:
      '3rd. kevin beeps in celebration. congrats to the keytar. it looked delicious',
  },
  {
    day: 10,
    name: 'marco',
    message:
      'the pick was mine. i said no first. the drumstick is still better. 7/10',
  },
  {
    day: 10,
    name: 'xX_CometGirl_Xx',
    message:
      '@jess a DRUMSTICK and a SETLIST and now a PICK??? ur shrine is bigger than my site',
  },
];
