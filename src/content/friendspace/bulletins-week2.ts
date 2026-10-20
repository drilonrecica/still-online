// Friendspace bulletins for week two (days 6–10, bible §6): three a day, following the chats.
// Jess's wall of fame, the contest, Lakeview sold out and 2nd place; Kayla vs Brianna for class rep
// (the 61–61 tie, co-reps); Velvet Lantern at the rec hall (the setlist, "83"); Pia's hamster
// petition and the fish. "NEW PICS on pixlog" only on the day that friend's album goes up
// (Theo 6, Kayla 7, Jess and Dex 9, Marco and Pia 10). Day 10 is after the show.
import { g } from '../gender';
import type { Bulletin } from './types';

export const BULLETINS_WEEK2: readonly Bulletin[] = [
  // Day 6: the drumstick on the wall, the rec hall for real, Theo's drawings on the art wall.
  {
    id: 'd6-jess-wall-tour',
    day: 6,
    from: { contactId: 'jess' },
    subject: 'ZIGGY TOUCHED THIS (a tour of my wall)',
    body:
      'stop 1: the DRUMSTICK. two nails. over my bed. label says ZIGGY TOUCHED THIS. ' +
      'stop 2: my forehead. its purple. its a star if u squint. ' +
      'stop 3: my mom asking questions. tour over. repost if u have a wall of fame',
  },
  {
    id: 'd6-marco-rec-hall',
    day: 6,
    from: { contactId: 'marco' },
    subject: 'velvet lantern. rec hall. for real',
    body:
      'the westfield rec hall. saturday. doors at 6. all ages. fits 80. ' +
      'yes. the saturday show i told u about. bingo took the first date. bingo always wins. ' +
      'we need a poster. not soup',
    link: 'http://friendspace.example/band/velvet-lantern',
  },
  {
    id: 'd6-theo-new-pics',
    day: 6,
    from: { contactId: 'theo' },
    subject: 'new pics on pixlog. sorry',
    body: 'mr dalton put my cell drawings on the wall in room 12. i took pics. sorry for the bulletin. and the pics',
    link: 'http://pixlog.example/theo',
  },
  // Day 7: the campaign starts, Brianna has bangs, the fan art contest.
  {
    id: 'd7-kayla-vote',
    day: 7,
    from: { contactId: 'kayla' },
    subject: '~*VOTE KAYLA 4 CLASS REP*~ (NEW PICS)',
    body:
      'i signed up. 4 minutes before the deadline. thats called DESTINY. ' +
      'my posters r in the east hallway. the campaign pics r on pixlog. ' +
      `the peace treaty is suspended. its called POLITICS. ${g('vote kayla ~*~', 'vote kayla. guys too')}`,
    link: 'http://pixlog.example/kayla',
  },
  {
    id: 'd7-brianna-vote',
    day: 7,
    from: { extra: 'Brianna', seed: 'brianna' },
    subject: 'vote brianna :) (yes i have bangs now)',
    body: 'running for class rep!! i have ideas. and bangs. vote brianna :) ps the bangs were MY idea. pps ok they werent',
  },
  {
    id: 'd7-cometgirl-contest',
    day: 7,
    from: { extra: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    subject: 'FAN ART CONTEST!!!',
    body: 'the fan site has a CONTEST!!! theme: the comets in space!!! due TOMORROW!!! the winners get SIGNED STUFF!!! repost 2 every comet u know!!!',
    link: 'http://tinfoilcomets.example/',
  },
  // Day 8: Lakeview sells out, the hamster petition, the setlist is final.
  {
    id: 'd8-jess-lakeview',
    day: 8,
    from: { contactId: 'jess' },
    subject: 'LAKEVIEW SOLD OUT. I AM NOT OK',
    body:
      'NINE MINUTES. it sold out in NINE MINUTES. i was on the phone the WHOLE time. ' +
      'BUT. its the same night as marcos show. so im going 2 the rec hall. ' +
      `{name} better come too ${g('(L)', '(Y)')}. I NEED A NEW SIGN`,
  },
  {
    id: 'd8-pia-petition',
    day: 8,
    from: { contactId: 'pia' },
    subject: 'SIGN MY HAMSTER PETITION (u have to)',
    body:
      "mom said WE'LL SEE. everyone knows what that means. so now there is a PETITION. " +
      `signatures so far: me. biscuit (paw). dad (he said "sure"). {name} (${g('she', 'he')} had to). ` +
      'sign below. professor nibbles is counting on u',
  },
  {
    id: 'd8-derek-setlist',
    day: 8,
    from: { extra: 'derek (drums)', seed: 'derekdrums' },
    subject: 'setlist. final. the bucket is in 3',
    body: '8 songs. the bucket is in 3 of them. marco negotiated. i negotiated better. the grip tapes open. see u at the rec hall',
    link: 'http://friendspace.example/band/velvet-lantern',
  },
  // Day 9: the tie, the contest results, the Jam.
  {
    id: 'd9-kayla-tie',
    day: 9,
    from: { contactId: 'kayla' },
    subject: '~*61 to 61*~',
    body: '61 to 61. one ballot said "mystery loaf". it doesnt count. me and brianna r in the OFFICE. pray 4 me. or 4 her. no. me',
  },
  {
    id: 'd9-jess-new-pics',
    day: 9,
    from: { contactId: 'jess' },
    subject: 'NEW PICS on pixlog!!! 2ND PLACE',
    body: 'I GOT 2ND IN THE FAN ART CONTEST!!! i won the SIGNED SETLIST. ziggy signed it TWICE. i lost to pasta. i am ok. pics r up',
    link: 'http://pixlog.example/jess',
  },
  {
    id: 'd9-dex-new-pics',
    day: 9,
    from: { contactId: 'dex' },
    subject: 'new pics on pixlog. the jam',
    body: 'got 3rd. landed it. kev took the pics. lens cap off this time',
    link: 'http://pixlog.example/dex',
  },
  // Day 10: after the show. 83 people, the fish, co-reps.
  {
    id: 'd10-marco-83',
    day: 10,
    from: { contactId: 'marco' },
    subject: '83',
    body:
      'the room fits 80. 83 came. fire code is a suggestion. ' +
      'the mic only works upside down. so we did too. the bucket got kicked in a 4th song. ' +
      'thanks to everyone. all 83 of u. pics are up',
    link: 'http://pixlog.example/marco',
  },
  {
    id: 'd10-pia-new-pics',
    day: 10,
    from: { contactId: 'pia' },
    subject: 'NEW PICS on pixlog!! MY FISH',
    body: 'his name is SIR STARDUST THE SECOND. he is a goldfish. he is NOT a hamster. he is still a pet. i was not allowed at the show. there is a pic of my face about it',
    link: 'http://pixlog.example/pia',
  },
  {
    id: 'd10-kayla-co-reps',
    day: 10,
    from: { contactId: 'kayla' },
    subject: '~*co-reps. and a plot twist*~',
    body:
      'dr hargrove made us CO-REPS. me AND brianna. ' +
      'then we went 2 the show in the exact same thing. down to the SCRUNCHIE. she said "u too". ' +
      'we r not friends. we r co-reps. ...ok we r friends',
  },
];
