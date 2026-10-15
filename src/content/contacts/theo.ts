// Theo: the shy classmate from bio. Short, hesitant lines, apologises a lot.
import type { ContactContent } from '../types';
import { theoDayScripts, theoDays } from './theo-days';

export const theo: ContactContent = {
  contact: {
    id: 'theo',
    displayName: 'theo',
    handle: 'theo.k@livemail.example',
    avatar: { kind: 'pattern', seed: 'theo', colors: ['#5B8C5A', '#E8F1D4'] },
    group: 'School',
    initialStatus: 'online',
    personalMessage: 'bio project due fri...',
    signInAfterMs: 210_000,
    days: theoDays,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: 'um hi', delayMs: 15_000 },
            { text: 'is this {name}? from bio?', delayMs: 2500 },
          ],
          choices: [
            { text: 'yeah! hi theo', label: 'Yeah, hi!', next: 'yes' },
            { text: 'who is this?', next: 'who' },
          ],
        },
        who: {
          lines: [
            { text: 'oh. sorry. its theo', delayMs: 2000 },
            { text: 'i sit behind u in bio', delayMs: 1500 },
          ],
          choices: [
            { text: 'oh hey theo!', next: 'yes' },
            {
              text: 'the one with the cool drawings?',
              label: 'The drawings guy?',
              next: 'drawings',
            },
          ],
        },
        drawings: {
          lines: [
            { text: 'oh. u saw those?', delayMs: 2200 },
            { text: 'theyre not that good', delayMs: 1400 },
          ],
          choices: [
            { text: 'theyre really good tho', next: 'project' },
            { text: 'lol the frog one was awesome', next: 'project' },
          ],
        },
        yes: {
          lines: [
            {
              text: 'ok good. i wasnt sure i had the right address',
              delayMs: 2000,
            },
          ],
          choices: [
            { text: 'whats up?', next: 'project' },
            { text: 'lol of course u did', next: 'project' },
          ],
        },
        project: {
          lines: [
            {
              text: 'so um. we r partners for the cell project',
              delayMs: 2500,
            },
            { text: 'mr dalton paired us', delayMs: 1500 },
            { text: 'sorry', delayMs: 1200 },
          ],
          choices: [
            {
              text: 'cool! wanna meet at the library?',
              label: 'Library?',
              next: 'library',
            },
            {
              text: 'can u just do it lol',
              label: 'U do it lol',
              next: 'doall',
            },
          ],
        },
        doall: {
          lines: [
            { text: 'oh. um. ok i guess', delayMs: 3000 },
            { text: '...', delayMs: 2000 },
          ],
          choices: [
            {
              text: 'jk jk!! we do it together',
              label: 'jk!!',
              next: 'library',
            },
            { text: 'no seriously', next: 'solo' },
          ],
        },
        library: {
          lines: [{ text: 'ok yeah. thursday after school?', delayMs: 2200 }],
          choices: [
            { text: 'thursday works (Y)', next: 'thursday' },
            { text: 'can we do wednesday?', next: 'wednesday' },
          ],
        },
        thursday: {
          lines: [
            { text: 'cool. ill bring markers :)', delayMs: 1800 },
            { delayMs: 2000, personalMessageChange: 'thursday: library :)' },
          ],
          end: true,
        },
        wednesday: {
          lines: [
            { text: 'wednesday i have piano', delayMs: 2000 },
            { text: 'but ok. i can skip it. dont tell my mom', delayMs: 2500 },
          ],
          end: true,
        },
        solo: {
          lines: [
            { text: 'ok', delayMs: 4000 },
            { delayMs: 1000, statusChange: 'away' },
          ],
          end: true,
        },
      },
    },
    {
      id: 'poster',
      trigger: { type: 'afterMinutes', minutes: 12 },
      start: 'poster',
      nodes: {
        poster: {
          lines: [
            { text: 'um {name}?', delayMs: 0 },
            {
              text: 'i made a draft of the poster. its kind of bad',
              delayMs: 2500,
            },
          ],
          choices: [
            { text: 'send it!', next: 'send' },
            { text: 'im sure its great', next: 'great' },
          ],
        },
        send: {
          lines: [
            {
              text: 'its on my brothers computer. ill bring it tmrw',
              delayMs: 2200,
            },
          ],
          end: true,
        },
        great: {
          lines: [{ text: 'thanks :)', delayMs: 2500 }],
          end: true,
        },
      },
    },
    {
      id: 'nudged',
      trigger: { type: 'onPlayerNudge' },
      start: 'oh',
      repeat: true,
      nodes: {
        oh: {
          lines: [
            {
              text: 'oh! hi. sorry, was i supposed to say something?',
              delayMs: 1500,
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup1',
      trigger: { type: 'afterScript', scriptId: 'opening', minutes: 2 },
      start: 'q',
      nodes: {
        q: {
          lines: [
            { text: 'um. sorry. me again', delayMs: 4000 },
            { text: 'quick question about the project', delayMs: 2000 },
            {
              text: 'should we do a plant cell or an animal cell?',
              delayMs: 2200,
            },
          ],
          choices: [
            { text: 'plant cell!', next: 'plant' },
            { text: 'animal cell', next: 'animal' },
            { text: 'idk u pick :)', label: 'U pick', next: 'pick' },
          ],
        },
        pick: {
          lines: [
            { text: 'oh. um', delayMs: 3000 },
            { text: 'ok', delayMs: 2000 },
            { text: 'sorry. im bad at picking things', delayMs: 2200 },
            { text: 'plant? i think plant', delayMs: 2500 },
          ],
          choices: [
            { text: 'plant it is (Y)', next: 'plant' },
            { text: 'good choice theo', next: 'plant' },
          ],
        },
        plant: {
          lines: [
            { text: 'ok cool', delayMs: 1800 },
            {
              text: 'i can draw the chloroplasts. theyre like little green beans',
              delayMs: 2500,
            },
            { text: 'sorry. that was a weird thing to say', delayMs: 2000 },
          ],
          choices: [
            { text: 'lol no thats cute', next: 'cute' },
            {
              text: 'green beans r a good description tbh',
              label: 'Accurate',
              next: 'cute',
            },
          ],
        },
        animal: {
          lines: [
            { text: 'ok', delayMs: 1800 },
            {
              text: 'the mitochondria is the powerhouse of the cell',
              delayMs: 2500,
            },
            { text: 'sorry. i had to', delayMs: 2000 },
          ],
          choices: [
            { text: 'LOL theo', next: 'cute' },
            {
              text: 'mr dalton would be proud',
              label: 'Dalton = proud',
              next: 'proud',
            },
          ],
        },
        proud: {
          lines: [
            { text: 'he says it like every class', delayMs: 2200 },
            { text: 'i counted once. 7 times', delayMs: 1800 },
            { text: 'sorry. i get bored sometimes', delayMs: 2000 },
          ],
          end: true,
        },
        cute: {
          lines: [
            { text: ':)', delayMs: 2500 },
            { text: 'ok. ill start sketching', delayMs: 1500 },
            {
              delayMs: 1500,
              personalMessageChange: 'drawing cells. pls dont talk to me. jk',
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup2',
      trigger: { type: 'afterScript', scriptId: 'followup1', minutes: 4 },
      start: 'jello',
      nodes: {
        jello: {
          lines: [
            { text: 'hi. sorry', delayMs: 3000 },
            { text: 'i told my mom about the project', delayMs: 2000 },
            {
              text: 'she said we could make a 3d cell out of jello',
              delayMs: 2500,
            },
            { text: 'is that dumb. its probably dumb', delayMs: 2000 },
          ],
          choices: [
            {
              text: 'JELLO CELL!! thats genius',
              label: 'Genius!!',
              next: 'genius',
            },
            {
              text: 'wouldnt it melt on the bus tho',
              label: 'It would melt?',
              next: 'melt',
            },
          ],
        },
        melt: {
          lines: [
            { text: 'oh', delayMs: 2500 },
            { text: 'yeah. u r right. sorry', delayMs: 2000 },
            { text: 'forget i said anything', delayMs: 1800 },
          ],
          choices: [
            {
              text: 'no wait we could keep it in a cooler!',
              label: 'Use a cooler!',
              next: 'cooler',
            },
            {
              text: 'its a cool idea tho. maybe for extra credit?',
              label: 'Extra credit?',
              next: 'extra',
            },
          ],
        },
        cooler: {
          lines: [
            { text: 'oh. we have a cooler', delayMs: 2200 },
            {
              text: 'from when we went camping. it smells like fish a bit',
              delayMs: 2500,
            },
            { text: 'but it would work', delayMs: 1500 },
          ],
          choices: [
            { text: 'fishy jello cell lol', next: 'genius' },
            { text: 'we can air it out', next: 'genius' },
          ],
        },
        extra: {
          lines: [
            { text: 'maybe', delayMs: 2500 },
            { text: 'ill ask mr dalton. if i can talk to him', delayMs: 2000 },
            { text: 'ok i have piano now. sorry. bye', delayMs: 2200 },
            { delayMs: 1500, statusChange: 'away' },
          ],
          end: true,
        },
        genius: {
          lines: [
            { text: 'really?', delayMs: 2000 },
            { text: 'ok. grapes can be the mitochondria', delayMs: 2200 },
            { text: 'and a plum for the nucleus', delayMs: 1800 },
            { text: 'sorry. i got excited', delayMs: 2000 },
          ],
          choices: [
            {
              text: 'dont be sorry this is awesome',
              label: 'Dont be sorry',
              next: 'thanks',
            },
            {
              text: 'can we eat it after?',
              label: 'Eat it after?',
              next: 'eat',
            },
          ],
        },
        eat: {
          lines: [
            {
              text: 'i think that would be cannibalism. for cells',
              delayMs: 2800,
            },
            { text: 'but yes', delayMs: 1500 },
            { delayMs: 1500, personalMessageChange: 'jello cell (Y) dont ask' },
          ],
          end: true,
        },
        thanks: {
          lines: [
            { text: 'ok', delayMs: 2500 },
            { text: 'um. thanks {name}', delayMs: 2000 },
            {
              text: 'im glad mr dalton paired us. sorry if thats weird',
              delayMs: 2500,
            },
            { delayMs: 1500, personalMessageChange: 'jello cell (Y) dont ask' },
          ],
          end: true,
        },
      },
    },
    ...theoDayScripts,
  ],
};
