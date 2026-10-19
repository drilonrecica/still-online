// Marco's Friendspace profile: black and minimal. Marco never uses exclamation marks (others may).
// Velvet Lantern at the Bean Cellar: the flyer (2), Derek quits (3), Derek un-quits (4), 11 people (5).
import { g } from '../../gender';
import type { ProfileContent } from './types';

export const marcoProfile: ProfileContent = {
  contactId: 'marco',
  headline: 'velvet lantern. tickets at the door.',
  mood: { text: 'unimpressed', emoticon: '(8)' },
  songTrackId: 'cool-rock',
  aboutMe:
    'college. bass. velvet lantern. ' +
    'this page is not for my mom. hi mom. ' +
    'we play small rooms on purpose. its called exclusive. ' +
    'if u found this page through aunt rita, please log off',
  wantToMeet: 'a drummer who stays',
  interests: [
    { label: 'Music', text: 'velvet lantern. and bands u havent heard of' },
    { label: 'Movies', text: 'the directors cut. always' },
    { label: 'Television', text: 'no' },
    { label: 'Books', text: 'the ones with no pictures on the cover' },
    { label: 'Heroes', text: 'anyone who shows up to practice on time' },
  ],
  top8: [
    { kind: 'extra', name: 'derek (drums)', seed: 'derekdrums' },
    { kind: 'player' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'dex' },
    { kind: 'extra', name: 'Aunt Rita', seed: 'auntrita' },
    { kind: 'contact', id: 'theo' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'Aunt Rita',
      text: 'Marco honey, call your mother!!! She says you never call!!! Love, Aunt Rita',
    },
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'MARCO when is ur next show!!! i will bring a sign!!!',
    },
    {
      day: 2,
      from: 'derek (drums)',
      text: 'flyer looks sick. bean cellar here we come',
    },
    {
      day: 2,
      from: 'Aunt Rita',
      text: 'I put the flyer on my fridge!!! And at the post office!!!',
    },
    {
      day: 3,
      from: 'derek (drums)',
      text: 'im out. for real this time. dont call me',
    },
    {
      day: 3,
      from: 'kayla',
      contactId: 'kayla',
      text: 'is derek ok?? his away message is SO sad',
    },
    {
      day: 4,
      from: 'derek (drums)',
      text: 'ok im back. bringing a bucket. and a tambourine. dont ask',
    },
    {
      day: 4,
      from: 'pia',
      contactId: 'pia',
      text: 'ur band is loud. i like it a little bit',
    },
    {
      day: 5,
      from: 'jess',
      contactId: 'jess',
      text: '11 PEOPLE!!! thats SOLD OUT!!! velvet lantern 4 life',
    },
    {
      day: 5,
      from: 'Aunt Rita',
      text: 'So proud of you!!! Your mother cried!!! I counted 11!!!',
    },
    {
      day: 5,
      from: 'theo',
      contactId: 'theo',
      text: 'congrats on the show. sorry i couldnt come. i had piano',
    },
  ],
  commentsOnPlayer: [
    {
      day: 2,
      text: g(
        'nice page kid. lose the glitter',
        'nice page kid. very dark. respect',
      ),
    },
    { day: 3, text: 'derek quit. again. dont ask' },
    {
      day: 4,
      text: 'derek is back. with a bucket. dont ask about that either',
    },
    { day: 5, text: 'eleven people. ur on the list next time. front row' },
  ],
  theme: {
    background: '#0b0b0b',
    text: '#d6d6d6',
    accent: '#8fd3c8',
    glitter: false,
    font: "Georgia, 'Times New Roman', serif",
    panel: '#161616',
  },
};
