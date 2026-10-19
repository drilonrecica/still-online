// Pia's Friendspace profile: pastel ponies, bossy little sibling. The pony crisis: Stardust is missing
// (2), it was Biscuit (3), found in the laundry (4), the present in the computer (5).
import type { ProfileContent } from './types';

export const piaProfile: ProfileContent = {
  contactId: 'pia',
  headline: 'PONIES R THE BEST. this is a FACT',
  mood: { text: 'bossy', emoticon: ':P' },
  songTrackId: 'pleasant-porridge',
  aboutMe:
    'this is PIAS page. i have 23 ponies and they all have names. stardust is the QUEEN. ' +
    'dad made me this page and i did the rest. it is the best page on friendspace. ' +
    '{name} lives in the room next to me. sadly. DO NOT go in my room. DO NOT copy my page',
  wantToMeet: 'a REAL pony. not a toy one. a real one that lives in our garden',
  interests: [
    { label: 'Music', text: 'pony songs and whatever comes on in dads car' },
    { label: 'Movies', text: 'every pony movie. some of them twice' },
    { label: 'Television', text: 'cartoons. u cant tell me what to watch' },
    {
      label: 'Books',
      text: 'horse quiz books. i know what a baby horse is called. do u',
    },
    {
      label: 'Heroes',
      text: 'Stardust. and dad when he lets me use the laptop',
    },
  ],
  top8: [
    { kind: 'extra', name: 'Stardust', seed: 'stardust' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'theo' },
    { kind: 'contact', id: 'dex' },
    { kind: 'band', id: 'sugarcube-parade' },
    { kind: 'player' },
  ],
  comments: [
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'PIA ur page is SO cute!!! the sparkles!!!',
    },
    {
      day: 1,
      from: 'ponyprincess_99',
      text: 'i have the purple one 2!!! we r pony twins!!!',
    },
    {
      day: 2,
      from: 'ponyprincess_99',
      text: 'stardust is MISSING?? i hope she comes home :(',
      graphic: 'hug',
    },
    {
      day: 2,
      from: 'kayla',
      contactId: 'kayla',
      text: 'pia i love ur ponies. sorry about stardust :(',
    },
    {
      day: 3,
      from: 'Biscuit',
      text: 'woof. (this is dad. biscuit says he did not do it)',
    },
    {
      day: 3,
      from: 'marco',
      contactId: 'marco',
      text: 'innocent until proven guilty kid. even dogs',
    },
    {
      day: 4,
      from: 'dex',
      contactId: 'dex',
      text: 'found it in the laundry? classic',
    },
    {
      day: 4,
      from: 'ponyprincess_99',
      text: 'SHE CAME HOME!!! best day ever!!!',
      graphic: 'glitterheart',
    },
    {
      day: 5,
      from: 'theo',
      contactId: 'theo',
      text: 'i drew u a pony with a star. its in my notebook. sorry about the legs',
    },
    {
      day: 5,
      from: 'Biscuit',
      text: 'woof. (dad again. biscuit accepts the sorry treat)',
    },
  ],
  commentsOnPlayer: [
    { day: 2, text: 'STARDUST IS MISSING. did u take her. answer HONESTLY' },
    { day: 3, text: 'it was biscuit. case closed' },
    { day: 4, text: 'i found her. DONT ask where. and dont tell mom' },
    { day: 5, text: 'go look at ur backrounds!!! u have to use it FOREVER' },
  ],
  theme: {
    background:
      'linear-gradient(135deg, #ffe0f4 0%, #e6d9ff 35%, #d4f4ff 70%, #fff6c9 100%)',
    text: '#4b2a66',
    accent: '#b47edb',
    glitter: true,
    font: "'Comic Sans MS', 'Chalkboard', cursive",
    panel: 'rgba(255, 255, 255, 0.85)',
    stickers: ['PONIES 4 EVA', '★ STARDUST ★', 'KEEP OUT'],
  },
};
