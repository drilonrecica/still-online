// Friendspace bulletins (`/bulletins`, P1-01): three or four a day from friends and Top 8 extras,
// following that day's chat. Chain letters (luck 2, crush 3, "if u dont repost" 3, Marco's
// "not a chain letter" 2), surveys (Kayla 1, Jess 3), the Tinfoil Comets countdown and aftermath,
// Pia's pony club, and "NEW PICS on pixlog!!" on the days the friends' albums go up
// (Dex 2, Pia 4, Jess and Kayla 5).
import { g } from '../gender';
import type { Bulletin } from './types';

export const BULLETINS: readonly Bulletin[] = [
  // Day 1: the radio contest tickets, Brianna's away message, the bio project starts.
  {
    id: 'd1-jess-comets-countdown',
    day: 1,
    from: { contactId: 'jess' },
    subject: 'TINFOIL COMETS COUNTDOWN!!!',
    body: 'only a few days left!!! who is coming?? repost if ur going 2 b there ~*~',
    link: 'http://tinfoilcomets.example/',
  },
  {
    id: 'd1-kayla-survey',
    day: 1,
    from: { contactId: 'kayla' },
    subject: '~*bulletin survey: 20 qs about me*~',
    body: [
      'repost w/ ur answers!! i will READ them',
      '1. name: kayla. duh',
      '2. nicknames: K, kay, drama princess (NOT queen)',
      '3. eyes: brown',
      '4. hair: perfect today. thx 4 asking',
      '5. fave color: pink. obviously',
      '6. fave lip gloss: the strawberry one',
      '7. fave song rite now: anything sad',
      '8. fave hoodie: the striped one. I HAD IT FIRST',
      '9. pets: Princess (my cat). she is a princess',
      '10. last person u IMed: {name}',
      '11. last thing u ate: popcorn 4 dinner. dont judge',
      '12. biggest fear: some1 copying my style',
      '13. do u keep secrets: yes. mostly',
      '14. have u ever cried in class: no. (yes)',
      '15. best friend: ppl who are LOYAL',
      '16. worst habit: checking my page every 5 min',
      '17. fave subject: lunch',
      '18. least fave subject: bio. the frog smell',
      '19. what r u wearing rite now: NOT stripes. long story',
      '20. who will repost this: u. bc ur loyal ;)',
    ].join('\n'),
  },
  {
    id: 'd1-pia-pony-club',
    day: 1,
    from: { contactId: 'pia' },
    subject: 'PIAS PONY CLUB!!! (official)',
    body:
      'PIAS PONY CLUB is now OPEN. meetings r in my room after school. ' +
      'rules: 1. u need a pony. 2. no touching stardust. 3. no running. 4. pia is the boss. ' +
      'dad is an honorary member. biscuit is on probation. {name} can NOT join. u know why',
  },
  // Day 2: sign emergency, the twin hoodies, Velvet Lantern's flyer, Dex starts filming.
  {
    id: 'd2-lexi-luck-chain',
    day: 2,
    from: { extra: 'lipgloss_lexi', seed: 'lipglosslexi' },
    subject: 'fw: fw: fw: GOOD LUCK',
    body: `repost this in 5 min and ${g('u will have the BEST hair day of ur life 2morrow', 'u will land ur first kickflip 2morrow')}. dont repost and u get 7 days of bad luck. i did and it WORKED`,
  },
  {
    id: 'd2-marco-not-a-chain-letter',
    day: 2,
    from: { contactId: 'marco' },
    subject: 'this is not a chain letter',
    body:
      'do not repost this. nothing will happen to u. ' +
      'velvet lantern. live at the bean cellar. one night only. the basement under the coffee place. ' +
      'the thing on the flyer is a lantern. not soup. thats the bulletin',
  },
  {
    id: 'd2-dex-new-pics',
    day: 2,
    from: { contactId: 'dex' },
    subject: 'new pics on pixlog',
    body: 'filming at the park. ry took the pics. im the blur',
    link: 'http://pixlog.example/dex',
  },
  // Day 3: outfit crisis, Kayla not invited, Derek quits, the jello wobbles.
  {
    id: 'd3-kayla-repost-or-else',
    day: 3,
    from: { contactId: 'kayla' },
    subject: '~*if u dont repost this ur not my friend*~',
    body:
      'REAL friends repost this. fake friends scroll past. ' +
      'some ppl hand out pink envelopes and forget certain ppl. i am not saying who. ' +
      'repost in 10 min if ur a REAL friend. i will know who scrolled past. i always know',
  },
  {
    id: 'd3-cometgirl-crush-chain',
    day: 3,
    from: { extra: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    subject: `fw: fw: fw: fw: ${g('CRUSH TEST!!!', 'HIGH SCORE TEST!!!')}`,
    body: g(
      'repost this in 10 min and ur crush will notice u by friday!!! dont repost and he will sit next to ur WORST ENEMY in every class. i reposted and he said hi 2 me at the bus stop!!!',
      'repost this in 10 min and u will beat ur high score by friday!!! dont repost and ur controller will die on the last level. my little brother reposted and beat the final boss first try!!!',
    ),
  },
  {
    id: 'd3-jess-survey',
    day: 3,
    from: { contactId: 'jess' },
    subject: 'BULLETIN SURVEY: 20 QS ABOUT ME!!!',
    body: [
      'DO IT!!! REPOST!!! :D',
      '1. name: JESS',
      '2. age: old enough 4 concerts',
      '3. fave band: TINFOIL COMETS. next question',
      '4. fave member: ZIGGY',
      '5. fave song: all of them. ok SPACE GIRL',
      '6. fave color: glitter',
      '7. pets: a cat. hes sparkly now. long story',
      '8. last concert: none yet. FRIDAY!!!',
      '9. what r u wearing friday: NOTHING. i have NOTHING 2 WEAR',
      '10. ok what r u REALLY wearing: idk!!! help!!!',
      '11. worst joke u know: why did the cd player cry? too many skips',
      '12. worst thing that happened this week: i spelled COMETS wrong. in glitter glue',
      '13. best thing: i won TICKETS!!! on the RADIO!!!',
      `14. who r u going w: {name}. BEST CONCERT BUDDY EVER ${g('(L)', '(Y)')}`,
      '15. can u sing: yes. my mom says no',
      '16. fave food: nachos',
      '17. biggest fear: losing the tickets AGAIN',
      '18. ur room is: covered in posters. and glitter',
      '19. last thing u said out loud: "MOM WHERE R MY STAR JEANS"',
      '20. ur mood rite now: CODE PINK',
    ].join('\n'),
  },
  // Day 4: one more sleep, Stardust is home, Derek un-quits, presentation nerves.
  {
    id: 'd4-jess-one-more-sleep',
    day: 4,
    from: { contactId: 'jess' },
    subject: '1 MORE SLEEP!!!!!',
    body:
      'TINFOIL COMETS. TOMORROW NIGHT. RIVERSIDE ARENA. ' +
      'sign: DONE (it has a paw print). tickets: my mom has them. outfit: disco ball mode. ' +
      'i will not sleep. i will not eat. i will only SCREAM. repost if ur going!!!',
    link: 'http://friendspace.example/band/tinfoil-comets',
  },
  {
    id: 'd4-pia-new-pics',
    day: 4,
    from: { contactId: 'pia' },
    subject: 'NEW PICS on pixlog!! SHE IS HOME!!!',
    body: 'STARDUST IS HOME. there r pics. do NOT ask where i found her. the case is CLOSED',
    link: 'http://pixlog.example/pia',
  },
  {
    id: 'd4-derek-back',
    day: 4,
    from: { extra: 'derek (drums)', seed: 'derekdrums' },
    subject: 're: re: re: im out',
    body: 'ok im back. velvet lantern is ON. one snare and a bucket. the bucket is a drum. the tambourine stays',
    link: 'http://friendspace.example/band/velvet-lantern',
  },
  {
    id: 'd4-theo-luck-repost',
    day: 4,
    from: { contactId: 'theo' },
    subject: 'fw: GOOD LUCK',
    body:
      'um. sorry. i dont usually repost these. ' +
      'but we present our bio project tomorrow. so. just in case. sorry for the bulletin',
  },
  // Day 5: front row, the drumstick, sleepover survivor, 11 people.
  {
    id: 'd5-jess-new-pics',
    day: 5,
    from: { contactId: 'jess' },
    subject: 'NEW PICS on pixlog!!! FRONT ROW!!!!!',
    body: 'I WAS IN THE FRONT ROW. I CAUGHT ZIGGYS DRUMSTICK. there r PICS. (of the drumstick. and my forehead)',
    link: 'http://pixlog.example/jess',
  },
  {
    id: 'd5-cometgirl-aftermath',
    day: 5,
    from: { extra: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    subject: 'RIVERSIDE WAS THE BEST NIGHT OF MY LIFE!!!',
    body: 'some1 caught ziggys drumstick WITH THEIR FACE. whoever u r: ur a LEGEND. new concert pics r on my site!!!',
    link: 'http://tinfoilcomets.example/pics',
  },
  {
    id: 'd5-kayla-new-pics',
    day: 5,
    from: { contactId: 'kayla' },
    subject: '~*NEW PICS on pixlog: sleepover survivor*~',
    body: 'the sleepover pics r up. yes brianna is in them. yes we have the same ice cream. no i will not explain',
    link: 'http://pixlog.example/kayla',
  },
];
