// Kayla on Pixlog, days 6–10 (bible §7): bangs (6), the class rep campaign vs Brianna (7; album),
// the speech (8), 61 to 61 (9) and co-reps who matched at the show by accident (10).
import { g } from '../gender';
import type { PixlogWeek } from './types';

export const kaylaPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'kayla-campaign',
      day: 7,
      title: '~*bangs + a campaign*~',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5231,
            day: 6,
            look: 'long',
            caption: '~*bangs. day 1. no regrets*~',
          },
          comments: [
            { day: 7, from: 'lipgloss_lexi', text: 'the BANGS. iconic' },
            { day: 7, from: 'jess', text: 'U LOOK LIKE A POP STAR!!!' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5232,
            day: 7,
            look: 'long',
            caption: '~*bangs. day 2. still no regrets. ok 1*~',
          },
          comments: [
            { day: 7, from: 'Brianna', text: 'nice bangs ;)' },
            { day: 7, from: 'kayla', text: 'i KNOW' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5233,
            day: 7,
            caption:
              'the sign-up sheet. 4 minutes before the deadline. DESTINY',
          },
          comments: [
            { day: 7, from: 'pia', text: 'can i vote. i am almost 10' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5234,
            day: 7,
            caption:
              'my posters. east hallway. briannas r right next to mine. coincidence?? NO',
          },
          comments: [
            { day: 7, from: 'dex', text: 'thats a lot of posters' },
            { day: 8, from: 'marco', text: 'vote loaf' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5235,
            day: 7,
            caption: '~*campaign HQ*~ (my desk in homeroom)',
          },
          comments: [
            {
              day: 7,
              from: 'theo',
              text: 'nice lettering. sorry. i notice lettering',
            },
            { day: 8, from: 'jess', text: 'VOTE KAYLA!!!' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'kayla-politics',
      day: 7,
      title: '~*politics*~',
      body:
        'so brianna walked in w BANGS. my bangs. and signed up 4 class rep.\n\n' +
        'so i signed up 2. 4 minutes before the deadline.\n\n' +
        'the peace treaty is suspended. its called POLITICS. look it up',
    },
    {
      id: 'kayla-co-reps',
      day: 10,
      title: '~*co-reps*~',
      body:
        'it was 61 to 61. dr hargrove said we r CO-REPS. both of us. 1 job.\n\n' +
        'then we went 2 the show. in the EXACT same thing. down to the SCRUNCHIE. brianna said "u too".\n\n' +
        'we r not friends. we r co-reps.\n\n' +
        '...ok we r friends ~*plot twist*~',
    },
  ],
  shouts: [
    { day: 6, text: '~*new hair who dis*~' },
    { day: 6, text: '~*bangs: a lifestyle*~' },
    { day: 7, text: '~*it is ON*~' },
    { day: 8, text: '~*writing a speech. do not disturb*~' },
    {
      day: 8,
      text: 'bangs AND brains or NO MORE MYSTERY LOAF. ~*the ppl will decide*~',
    },
    { day: 9, text: '~*vote day. pls hold*~' },
    { day: 9, text: '~*61 to 61. i cant*~' },
    { day: 10, text: '~*co-rep*~ (long story)' },
    {
      day: 10,
      text: g(
        '~*matching. dont ask*~ thx 4 the help yesterday (L)',
        '~*matching. dont ask*~ (Y)',
      ),
    },
  ],
  kudosToPlayer: [10],
  guestbook: [
    {
      day: 7,
      from: 'Brianna',
      text: 'nice bangs. may the best bangs win ;)',
    },
    {
      day: 10,
      from: 'jess',
      text: 'CO-REPS!!! AND U MATCHED!!! THE UNIVERSE IS SO WEIRD!!!',
    },
  ],
};
