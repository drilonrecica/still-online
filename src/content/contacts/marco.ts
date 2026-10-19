// Marco: the cool older cousin at college. Lowercase, dry, never uses exclamation marks.
import { g } from '../gender';
import type { ContactContent } from '../types';
import { marcoBoyThreads } from './marco-boy';
import { marcoDayScripts, marcoDays } from './marco-days';
import { marcoGameScore } from './game-reactions';
import { marcoNowPlaying2 } from './now-playing';
import { marcoTop8Dropped, marcoTop8Readded } from './top8-reactions';

export const marco: ContactContent = {
  contact: {
    id: 'marco',
    displayName: 'marco | velvet lantern',
    handle: 'marco.bassline@livemail.example',
    avatar: { kind: 'pattern', seed: 'marco', colors: ['#2E3A4F', '#8FD3C8'] },
    group: 'family',
    initialStatus: 'busy',
    personalMessage: 'studio session tonight. dont call.',
    signInAfterMs: 150_000,
    days: marcoDays,
    awayReply: 'away. classic.',
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hey',
      nodes: {
        hey: {
          lines: [
            { text: 'hey kid', delayMs: 6000 },
            { text: 'heard u got a new computer. nice', delayMs: 1200 },
          ],
          choices: [
            { text: 'yeah its sooo fast', label: 'So fast', next: 'fast' },
            { text: 'who told u that??', label: 'Who told u?', next: 'who' },
          ],
        },
        who: {
          lines: [
            { text: 'aunt rita. she tells everyone everything', delayMs: 1500 },
            { text: 'u know this', delayMs: 800 },
          ],
          choices: [
            { text: 'true story', next: 'band' },
            { text: 'ugh. family', next: 'band' },
          ],
        },
        fast: {
          lines: [
            { text: 'enjoy it while it lasts', delayMs: 1300 },
            { text: 'and dont fill it with toolbars lol', delayMs: 900 },
          ],
          choices: [
            { text: 'what toolbars?', next: 'toolbars' },
            { text: 'too late haha', next: 'late' },
          ],
        },
        toolbars: {
          lines: [
            {
              text: 'the ones that come with every free screensaver. trust me',
              delayMs: 1800,
            },
          ],
          choices: [
            { text: 'ok ok no screensavers', label: 'Ok ok', next: 'band' },
            {
              text: 'but the fish one is so cool',
              label: 'But the fish one...',
              next: 'band',
            },
          ],
        },
        late: {
          lines: [
            { text: 'lol. classic', delayMs: 1000 },
            {
              text: 'it starts with one smiley pack and then its over',
              delayMs: 1400,
            },
          ],
          choices: [
            { text: 'can u fix it?', label: 'Can u fix it?', next: 'fix' },
            {
              text: 'whatever. hows college?',
              label: 'Hows college?',
              next: 'band',
            },
          ],
        },
        fix: {
          lines: [
            { text: 'thanksgiving. bring snacks', delayMs: 1500 },
            { text: 'gotta go, practice. later kid', delayMs: 1000 },
            { delayMs: 800, statusChange: 'away' },
          ],
          end: true,
        },
        band: {
          lines: [
            { text: 'anyway. the band finally got a real gig', delayMs: 1500 },
            { text: 'velvet lantern @ the rec hall, saturday', delayMs: 1200 },
          ],
          choices: [
            { text: 'can i come??', next: 'come' },
            {
              text: 'ur band is still a thing?',
              label: 'Still a thing?',
              next: 'roast',
            },
          ],
        },
        come: {
          lines: [
            { text: 'if ur mom says ok. ill put u on the list', delayMs: 1600 },
            { text: 'dont tell anyone u know me tho', delayMs: 1100 },
            {
              delayMs: 2000,
              personalMessageChange: 'velvet lantern live sat. (Y)',
            },
          ],
          end: true,
        },
        roast: {
          lines: [
            { text: 'wow. ok. cold', delayMs: 1400 },
            {
              text: 'u can still come. ill dedicate a song to ur attitude',
              delayMs: 1600,
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'nowPlaying',
      trigger: { type: 'onNowPlaying' },
      start: 'taste',
      nodes: {
        taste: {
          lines: [
            { text: '{title}? ok ur taste is improving', delayMs: 4000 },
            { text: 'still not velvet lantern but its a start', delayMs: 1300 },
          ],
          end: true,
        },
      },
    },
    {
      id: 'practice',
      trigger: { type: 'afterMinutes', minutes: 9 },
      start: 'bye',
      nodes: {
        bye: {
          lines: [
            { text: 'heading to practice. be good', delayMs: 0 },
            {
              delayMs: 1500,
              statusChange: 'away',
              personalMessageChange: 'at practice. srsly dont call',
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup1',
      trigger: { type: 'afterScript', scriptId: 'opening', minutes: 2 },
      start: 'ask',
      nodes: {
        ask: {
          lines: [
            { text: 'ok question', delayMs: 5000 },
            {
              text: 'ur fancy new computer. it has a paint program right',
              delayMs: 1300,
            },
          ],
          choices: [
            { text: 'yeah duh. why', next: 'flyer' },
            {
              text: 'depends. whats in it for me',
              label: 'Whats in it for me?',
              next: 'deal',
            },
          ],
        },
        deal: {
          lines: [
            { text: 'wow. negotiating. who raised u', delayMs: 1300 },
            { text: 'a velvet lantern shirt. size small', delayMs: 1100 },
            {
              text: 'its the only size left. dont read into it',
              delayMs: 1200,
            },
          ],
          choices: [
            { text: 'deal (Y)', next: 'flyer' },
            {
              text: 'so nobody bought the small ones lol',
              label: 'Nobody bought them?',
              next: 'smalls',
            },
          ],
        },
        smalls: {
          lines: [
            { text: 'we sold two. to my mom', delayMs: 1400 },
            { text: 'moving on', delayMs: 900 },
          ],
          choices: [
            { text: 'lol ok. what do u need', next: 'flyer' },
            {
              text: 'ur mom is ur biggest fan :)',
              label: 'Biggest fan',
              next: 'flyer',
            },
          ],
        },
        flyer: {
          lines: [
            { text: 'we need a flyer for the next show', delayMs: 1400 },
            {
              text: 'our drummer made one. it looked like an invite to a 6 year olds birthday',
              delayMs: 1800,
            },
            {
              text: 'rainbow letters. clip art balloon. it was bad',
              delayMs: 1300,
            },
            { text: 'so. u in', delayMs: 900 },
          ],
          choices: [
            {
              text: g(
                'YES. glitter text and flames everywhere',
                'YES. flames everywhere. and a flaming skull',
              ),
              label: g('Glitter + flames', 'Flames + skull'),
              next: 'glitter',
            },
            {
              text: 'black and white. very dark. very serious',
              label: 'Dark and serious',
              next: 'serious',
            },
          ],
        },
        glitter: {
          lines: [
            { text: 'no', delayMs: 900 },
            { text: '...', delayMs: 1500 },
            {
              text: 'ok flames maybe. small flames. tasteful flames',
              delayMs: 1600,
            },
            {
              text: g(
                'if derek sees glitter he quits the band. again',
                'if derek sees a skull he quits the band. again. he says skulls r "for metal bands"',
              ),
              delayMs: 1300,
            },
            {
              delayMs: 1500,
              personalMessageChange: g(
                'new flyer in the works. no glitter. ok some flames',
                'new flyer in the works. no skulls. ok some flames',
              ),
            },
          ],
          end: true,
        },
        serious: {
          lines: [
            { text: 'see. this is why ur my favorite cousin', delayMs: 1500 },
            { text: 'dont tell the others i said that', delayMs: 1100 },
            {
              text: 'email it to me when ur done. no rush. by friday',
              delayMs: 1400,
            },
            {
              delayMs: 1500,
              personalMessageChange:
                'velvet lantern. new flyer soon. very serious',
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup2',
      trigger: { type: 'afterScript', scriptId: 'followup1', minutes: 4 },
      start: 'vote',
      nodes: {
        vote: {
          lines: [
            { text: 'u there', delayMs: 5000 },
            { text: 'need a tiebreaker. band emergency', delayMs: 1200 },
            { text: 'derek wants to change our name', delayMs: 1300 },
            { text: 'to "velvet lantern and the night shift"', delayMs: 1500 },
            {
              text: 'its 2 against 2. ur the deciding vote. no pressure',
              delayMs: 1400,
            },
          ],
          choices: [
            {
              text: 'keep velvet lantern obviously',
              label: 'Keep the name',
              next: 'keep',
            },
            {
              text: 'the night shift part is kinda cool tho',
              label: 'Night shift is cool',
              next: 'nightshift',
            },
            {
              text: 'what about "marco and the losers"',
              label: 'Marco and the losers',
              next: 'losers',
            },
          ],
        },
        keep: {
          lines: [
            { text: 'correct answer', delayMs: 1000 },
            {
              text: 'telling derek he got outvoted by my little cousin. hes gonna sulk all week',
              delayMs: 1800,
            },
          ],
          choices: [
            {
              text: 'tell him i said sorry lol',
              label: 'Say sorry',
              next: 'studio',
            },
            {
              text: 'good. he deserves it',
              label: 'He deserves it',
              next: 'studio',
            },
          ],
        },
        nightshift: {
          lines: [
            { text: 'wow', delayMs: 1100 },
            { text: 'betrayed by family', delayMs: 1000 },
            {
              text: 'ok fine. i said ud pick ours so now i owe derek a pizza',
              delayMs: 1700,
            },
          ],
          choices: [
            { text: 'sorry :P', next: 'studio' },
            {
              text: 'can i have a slice',
              label: 'Can i have a slice?',
              next: 'pizza',
            },
          ],
        },
        pizza: {
          lines: [
            { text: 'no', delayMs: 900 },
            {
              text: 'traitors dont get pizza. its in the band rules',
              delayMs: 1400,
            },
          ],
          end: true,
        },
        losers: {
          lines: [
            { text: 'hilarious', delayMs: 1200 },
            {
              text: 'derek laughed so hard he dropped a drumstick',
              delayMs: 1500,
            },
            {
              text: 'now hes voting for that. thanks a lot kid',
              delayMs: 1400,
            },
            {
              delayMs: 1500,
              personalMessageChange: 'band name: under review. (N)',
            },
          ],
          end: true,
        },
        studio: {
          lines: [
            {
              text: 'ok gotta go back in. the studio guy charges by the hour',
              delayMs: 1500,
            },
            { text: 'later kid', delayMs: 900 },
            {
              delayMs: 1200,
              statusChange: 'busy',
              personalMessageChange:
                'still velvet lantern. studio session. dont call',
            },
          ],
          end: true,
        },
      },
    },
    ...marcoDayScripts,
    ...marcoBoyThreads,
    marcoNowPlaying2,
    marcoGameScore,
    marcoTop8Dropped,
    marcoTop8Readded,
  ],
};
