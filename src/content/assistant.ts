// Stapley's tips. The engine (`os/assistant/tips.ts`) matches these against what the player does.
import type { AppId } from '@/os/types';

export type TipEvent = 'newDay' | 'idle' | 'firstBoot' | 'notepadLetter';

export type TipAction =
  /** Closes the balloon. */
  | 'dismiss'
  /** Closes the balloon and never offers this tip again (recorded in `settings.seenTips`). */
  | 'never'
  /** Opens an app, then closes the balloon. */
  | `openApp:${AppId}`;

export interface TipOption {
  label: string;
  action: TipAction;
  /** Shown in the balloon in place of the tip text (with a single OK) before the action runs. */
  reply?: string;
}

export interface Tip {
  /** Also the `seenTips` key. Prefixed `stapley-` so it can't clash with a balloon id. */
  id: string;
  trigger: { app?: AppId; event?: TipEvent };
  text: string;
  options?: TipOption[];
}

export const TIPS: readonly Tip[] = [
  {
    id: 'stapley-intro',
    trigger: { event: 'firstBoot' },
    text: "Hi! I'm Stapley. I hold things together. Need help?",
    options: [
      {
        label: 'Sure, what can you do?',
        action: 'dismiss',
        reply: 'Staple things. Mostly paper. Sometimes feelings.',
      },
      { label: 'No thanks', action: 'dismiss' },
    ],
  },
  {
    id: 'stapley-letter',
    trigger: { event: 'notepadLetter' },
    text: "It looks like you're writing a letter. Would you like help?",
    options: [
      {
        label: 'Get help with writing the letter',
        action: 'dismiss',
        reply: 'lol no',
      },
      { label: 'Just type the letter without help', action: 'dismiss' },
      { label: "Don't show me this tip again", action: 'never' },
    ],
  },
  {
    id: 'stapley-paint',
    trigger: { app: 'paint' },
    text: 'Did you know? You can set your masterpiece as your desktop background!',
    options: [{ label: 'Got it', action: 'dismiss' }],
  },
  {
    id: 'stapley-mail',
    trigger: { app: 'mail' },
    text: 'Never open attachments from strangers. Unless they say FWD 6 times.',
    options: [{ label: 'Got it', action: 'dismiss' }],
  },
  {
    id: 'stapley-mines',
    trigger: { app: 'mines' },
    text: 'Tip: the numbers are not a phone number.',
    options: [{ label: 'Got it', action: 'dismiss' }],
  },
  {
    id: 'stapley-fluff',
    trigger: { event: 'newDay' },
    text: 'Click the sheep in the tray to meet Fluff!',
    options: [{ label: 'Got it', action: 'dismiss' }],
  },
];

/** What Stapley says after 3 idle minutes, in rotation. Each joke can be silenced for good. */
export const IDLE_JOKES: readonly Tip[] = [
  'Why did the computer go to the doctor? It had a virus. Also it was a computer.',
  'My favourite folder is My Documents. It has the best documents.',
  'I asked the modem for a joke. It screamed at me for 30 seconds. Rude, but accurate.',
  'What do you call a sleeping computer? A snooze button with a monitor.',
  'There are 10 kinds of people: those who know binary and those who left their sandwich on the keyboard.',
  'Why was the mouse nervous? It had a cat-5 attached to it.',
  'A floppy disk walks into a bar. Nobody can tell what it holds.',
  'Defragmenting is just tidying with extra steps. And a progress bar.',
].map((text, i) => ({
  id: `stapley-joke-${i + 1}`,
  trigger: { event: 'idle' },
  text,
  options: [
    { label: 'Ha. OK', action: 'dismiss' },
    { label: 'No more of this joke', action: 'never' },
  ],
}));

/** Idle minutes before a joke. */
export const IDLE_JOKE_MINUTES = 3;
