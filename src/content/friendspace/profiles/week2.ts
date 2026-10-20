// Friendspace walls for week two (days 6–10, bible §6), appended to each profile by
// `withWallWeek`. Jess: the bruise → the contest → Lakeview sold out → 2nd place → the pick.
// Kayla: bangs → the election → the tie → co-reps. Theo: the art wall → the poster. Marco: the rec
// hall show (83). Pia: Operation Hamster → Sir Stardust the Second. Dex: 41 views → the Jam (3rd).
// Day 10 is after the show. Lines to the player use `g()`; a boy gets (Y), never hearts.
import { g } from '../../gender';
import type { ProfileWeek } from './types';

export const JESS_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'kayla',
      contactId: 'kayla',
      text: 'ur forehead is PURPLE. it does look like a star tho. if u squint',
    },
    {
      day: 6,
      from: 'dex',
      contactId: 'dex',
      text: 'two nails. respect',
    },
    {
      day: 7,
      from: 'pia',
      contactId: 'pia',
      text: 'can i touch the drumstick NOW. its on the wall. walls r for everyone',
    },
    {
      day: 7,
      from: 'xX_CometGirl_Xx',
      text: 'ur entering the contest right??? i am!!! may the best fan win!!!',
    },
    {
      day: 8,
      from: 'marco',
      contactId: 'marco',
      text: 'lakeview is the same night. just saying',
    },
    {
      day: 8,
      from: 'kayla',
      contactId: 'kayla',
      text: 'sold out in 9 MIN?? thats a crime. i would vote 4 a law',
    },
    {
      day: 9,
      from: 'xX_CometGirl_Xx',
      text: '2ND PLACE!!! congrats jess!!! the pasta was robbery but STILL!!!',
      graphic: 'thanks',
    },
    {
      day: 9,
      from: 'theo',
      contactId: 'theo',
      text: 'congrats on 2nd. the collage was really good. sorry. i mean congrats',
    },
    {
      day: 10,
      from: 'theo',
      contactId: 'theo',
      text: 'the sign was very readable. sorry',
    },
    {
      day: 10,
      from: 'dex',
      contactId: 'dex',
      text: 'got the catch on tape. u can hear it. with ur hand this time',
    },
  ],
  commentsOnPlayer: [
    {
      day: 8,
      text: `come to the rec hall w me!!! NEW SIGN ${g('(L)', '(Y)')}`,
    },
    {
      day: 10,
      text: 'THE SHRINE GREW!!! drumstick + setlist + PICK',
      graphic: 'thanks',
    },
  ],
};

export const KAYLA_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'lipgloss_lexi',
      text: 'BANGS??? kayla they r perfect. who did them',
    },
    {
      day: 6,
      from: 'jess',
      contactId: 'jess',
      text: 'BANGS!!! U LOOK LIKE A MOVIE!!!',
    },
    { day: 7, from: 'Brianna', text: 'nice bangs ;)' },
    {
      day: 7,
      from: 'dex',
      contactId: 'dex',
      text: 'saw ur posters. east hallway. theres a lot',
    },
    {
      day: 8,
      from: 'jess',
      contactId: 'jess',
      text: 'VOTE KAYLA!!! VOTE KAYLA!!! (i made a sign 4 u too)',
    },
    {
      day: 8,
      from: 'marco',
      contactId: 'marco',
      text: 'no more mystery loaf. that slogan has my vote. i dont go there',
    },
    { day: 9, from: 'Brianna', text: '61 each lol' },
    {
      day: 9,
      from: 'pia',
      contactId: 'pia',
      text: 'a TIE?? in my class we would do rock paper scissors',
    },
    { day: 10, from: 'Brianna', text: 'u too' },
    {
      day: 10,
      from: 'theo',
      contactId: 'theo',
      text: 'congrats on co-rep. both of u. sorry. i mean congrats',
    },
  ],
  commentsOnPlayer: [
    { day: 7, text: 'vote 4 me or else ;)' },
    {
      day: 9,
      text: g(
        'help me pick an outfit tmrw!! u have the best eye ~*~',
        '61-61. a guy vote wouldve won it. thx 4 voting tho (Y)',
      ),
    },
  ],
};

export const THEO_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'frogfan_02',
      text: 'ur frogs r on a WALL now?? at school?? legend',
    },
    {
      day: 6,
      from: 'Mom',
      text: 'Mr Dalton called. He said "proud". I cried a little. Love, Mom',
    },
    {
      day: 7,
      from: 'marco',
      contactId: 'marco',
      text: 'u draw. i need a poster. talk to the kid',
    },
    {
      day: 7,
      from: 'jess',
      contactId: 'jess',
      text: 'THEO MAKE IT SHINY. or dont. ur the artist',
    },
    { day: 8, from: 'kayla', contactId: 'kayla', text: 'draft A obviously' },
    {
      day: 8,
      from: 'dex',
      contactId: 'dex',
      text: 'draft B. the bucket is a deep cut',
    },
    {
      day: 9,
      from: 'pia',
      contactId: 'pia',
      text: 'i saw ur poster at the mall. i told mom u r FAMOUS',
    },
    {
      day: 9,
      from: 'marco',
      contactId: 'marco',
      text: 'posters are good. its a lantern. nobody asked about soup',
    },
    {
      day: 10,
      from: 'Aunt Rita',
      text: 'I took THREE posters!!! Love, Aunt Rita',
    },
    {
      day: 10,
      from: 'Mom',
      text: 'Your poster is on the fridge. Love, Mom',
    },
  ],
  commentsOnPlayer: [
    {
      day: 9,
      text: g('see u near the back. sorry. :)', 'back row crew. sorry'),
    },
    { day: 10, text: 'thanks for standing with me' },
  ],
};

export const MARCO_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'Aunt Rita',
      text: 'The rec hall!!! I am bringing a sign too!!! Love, Aunt Rita',
    },
    {
      day: 6,
      from: 'jess',
      contactId: 'jess',
      text: 'REC HALL!!! FOR REAL THIS TIME??? CONGRATS MARCO!!!',
    },
    { day: 7, from: 'derek (drums)', text: 'every song' },
    {
      day: 7,
      from: 'theo',
      contactId: 'theo',
      text: 'um. hi. the kid asked me about a poster. i said yes. sorry. i mean yes',
    },
    {
      day: 8,
      from: 'derek (drums)',
      text: 'ok 3 songs. but i get to kick it in a 4th. thats the deal',
    },
    {
      day: 8,
      from: 'dex',
      contactId: 'dex',
      text: 'can i film the show. if i find a tape',
    },
    {
      day: 9,
      from: 'theo',
      contactId: 'theo',
      text: 'the poster is done. sorry it took 2 days',
    },
    {
      day: 9,
      from: 'kayla',
      contactId: 'kayla',
      text: 'singing into an upside down mic is SO avant garde ~*~',
    },
    { day: 10, from: 'Aunt Rita', text: '83!!! I counted!!! Love, Aunt Rita' },
    {
      day: 10,
      from: 'pia',
      contactId: 'pia',
      text: 'next year i am coming. mom PROMISED. sort of',
    },
  ],
  commentsOnPlayer: [
    { day: 8, text: 'ur song. dont make it weird' },
    {
      day: 10,
      text: g('front row. well. a row', 'best crew in the business. only crew'),
    },
  ],
};

export const PIA_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'Mom',
      text: 'I read the 10 reasons. We will talk. Love, Mom',
    },
    {
      day: 6,
      from: 'dex',
      contactId: 'dex',
      text: 'reason 7 was good. the one about the wheel',
    },
    {
      day: 7,
      from: 'marco',
      contactId: 'marco',
      text: 'a castle for a hamster. thats more than my apartment',
    },
    {
      day: 7,
      from: 'Mom',
      text: 'Lovely presentation. Very professional. Love, Mom',
    },
    { day: 8, from: 'Biscuit', text: 'woof (no hamster)' },
    {
      day: 8,
      from: 'Mom',
      text: 'Biscuit did not write that. Love, Mom',
    },
    {
      day: 9,
      from: 'ponyprincess_99',
      text: 'a FISH!!! sir stardust the second is the best name EVER',
    },
    {
      day: 9,
      from: 'marco',
      contactId: 'marco',
      text: 'sir stardust. good name. strong',
    },
    { day: 10, from: 'Mom', text: 'Next year, sweetie. Love, Mom' },
    {
      day: 10,
      from: 'dex',
      contactId: 'dex',
      text: 'u can watch the tape. its basically the show',
    },
  ],
  commentsOnPlayer: [
    { day: 6, text: 'VOTE YES ON HAMSTER' },
    { day: 9, text: 'come meet SIR STARDUST THE 2ND (knock)' },
  ],
};

export const DEX_WEEK2: ProfileWeek = {
  comments: [
    { day: 6, from: 'Ry (my bro)', text: '41 views. 30 r his' },
    {
      day: 6,
      from: 'jess',
      contactId: 'jess',
      text: '41 VIEWS!!! DEX UR FAMOUS!!!',
    },
    { day: 7, from: 'Kickflip_Kev', text: 'JAM. U. DAY 9' },
    {
      day: 7,
      from: 'marco',
      contactId: 'marco',
      text: 'a contest. dont fall. or do. its art',
    },
    {
      day: 8,
      from: 'Ry (my bro)',
      text: 'hes been at the park since 7am. bring him a sandwich',
    },
    {
      day: 8,
      from: 'kayla',
      contactId: 'kayla',
      text: 'good luck at the jam dex!! campaign rule: always smile',
    },
    { day: 9, from: 'sam_grabs', text: '3rd. not bad for a filmer' },
    {
      day: 9,
      from: 'pia',
      contactId: 'pia',
      text: 'u got a TAPE?? from 2007?? thats THIS year',
    },
    { day: 10, from: 'Ry (my bro)', text: 'the tape is MINE' },
    {
      day: 10,
      from: 'theo',
      contactId: 'theo',
      text: 'thanks for filming. sorry if im in it. im near the back',
    },
  ],
  commentsOnPlayer: [
    { day: 9, text: '3rd. thx 4 the hype' },
    { day: 10, text: 'special thanks: u' },
  ],
};
