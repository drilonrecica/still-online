// Marco: the cool older cousin at college. Lowercase, dry, never uses exclamation marks.
import type { ContactContent } from '../types';

export const marco: ContactContent = {
  contact: {
    id: 'marco',
    displayName: 'marco | velvet lantern',
    handle: 'marco.bassline@livemail.example',
    avatar: { kind: 'pattern', seed: 'marco', colors: ['#2E3A4F', '#8FD3C8'] },
    group: 'Family',
    initialStatus: 'busy',
    personalMessage: 'studio session tonight. dont call.',
    signInAfterMs: 150_000,
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
  ],
};
