// Kayla's Friendspace profile: pink glitter, drama princess. The Brianna saga plays out on her wall
// (twin hoodies day 2, the "missing" invite day 3, Brianna is nice day 4, peace treaty day 5).
import { g } from '../../gender';
import type { ProfileContent } from './types';

export const kaylaProfile: ProfileContent = {
  contactId: 'kayla',
  headline: '~*some ppl r just jealous*~',
  mood: { text: 'fabulous', emoticon: ';)' },
  songTrackId: 'newer-wave',
  aboutMe:
    '~*~ welcome 2 my page ~*~ im kayla. i am NOT a drama queen. i am a drama PRINCESS. theres a difference. ' +
    'i love lip gloss, sparkles, sad songs when it rains and my striped hoodie (I HAD IT FIRST). ' +
    'if ur reading this ur either my friend or ur checking my page every 5 min. either way hi ;) ' +
    'real friends stay true. fake ones get deleted from my top 8. and NO u cant be in my top 8 just bc u asked',
  wantToMeet:
    'ppl who are LOYAL. and whoever invented lip gloss so i can say thank u',
  interests: [
    {
      label: 'Music',
      text: 'anything sad. or anything u can dance to. depends on the day',
    },
    {
      label: 'Movies',
      text: 'the ones where the girl gets her revenge AND the guy',
    },
    { label: 'Television', text: 'reality shows. its research' },
    { label: 'Books', text: 'my diary. its private. stop asking' },
    { label: 'Heroes', text: 'my mom. and anyone who can pull off stripes' },
  ],
  top8: [
    { kind: 'player' },
    { kind: 'contact', id: 'jess' },
    { kind: 'extra', name: 'lipgloss_lexi', seed: 'lipglosslexi' },
    { kind: 'contact', id: 'theo' },
    { kind: 'contact', id: 'dex' },
    { kind: 'extra', name: 'Princess (my cat)', seed: 'princesscat' },
    { kind: 'contact', id: 'pia' },
    { kind: 'contact', id: 'marco' },
  ],
  comments: [
    {
      day: 1,
      from: 'lipgloss_lexi',
      text: 'cute pic!!!! ur hair is PERFECT <3',
    },
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'KAYLA!!! I WON TICKETS!!! ok bye',
    },
    { day: 2, from: 'Brianna', text: 'cute hoodie ;)' },
    {
      day: 2,
      from: 'jess',
      contactId: 'jess',
      text: 'u and brianna were TWINS today lol. same hoodie. same face',
    },
    {
      day: 3,
      from: 'theo',
      contactId: 'theo',
      text: 'um. sorry about the sleepover thing. i didnt get invited either. not that its the same',
    },
    {
      day: 3,
      from: 'lipgloss_lexi',
      text: 'brianna is SO not worth it. ur 10x more fun anyway!!!',
      graphic: 'hug',
    },
    {
      day: 4,
      from: 'Brianna',
      text: 'did u get my email?? i hope u come tmrw!! :)',
    },
    {
      day: 4,
      from: 'pia',
      contactId: 'pia',
      text: 'ur hair is nice. dont tell anyone i said that',
    },
    {
      day: 5,
      from: 'Brianna',
      text: 'thx 4 coming!! we brought the same ice cream lol. twins',
    },
    {
      day: 5,
      from: 'jess',
      contactId: 'jess',
      text: 'PEACE TREATY!!! i want to be in the next sleepover (L)',
    },
    {
      day: 5,
      from: 'dex',
      contactId: 'dex',
      text: 'heard u and brianna r twins now. cool',
    },
  ],
  commentsOnPlayer: [
    {
      day: 2,
      text: 'omg ur on friendspace finally!!! ur in my top 8. #1 obviously. dont tell jess ;)',
      graphic: 'thanks',
    },
    {
      day: 3,
      text: `thx for listening yesterday. ur a real friend. ${g('(L)', '(Y)')}`,
      graphic: 'hug',
    },
    { day: 4, text: 'brianna is... NICE??? i am so confused. call me' },
    { day: 5, text: 'peace treaty friends. its a thing. ur still #1 tho ~*~' },
  ],
  theme: {
    background:
      'radial-gradient(circle at 20% 20%, #ffd1dc 0 18%, transparent 19%), radial-gradient(circle at 80% 60%, #ffb6d9 0 14%, transparent 15%), linear-gradient(180deg, #ff9ecb, #ff5fa2)',
    text: '#5a0f2e',
    accent: '#e0157a',
    glitter: true,
    font: "'Comic Sans MS', 'Chalkboard', cursive",
    panel: 'rgba(255, 240, 246, 0.92)',
  },
};
