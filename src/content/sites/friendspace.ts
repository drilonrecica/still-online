// friendspace.example: "Friendspace: a place for friends in orbit". Site text, theme presets and the
// player's starting profile. Friend profiles live in src/content/friendspace/profiles/.
import { g } from '../gender';
import type {
  PlayerProfile,
  ProfileTheme,
} from '../friendspace/profiles/types';
import type { SiteMeta } from './types';

export const FRIENDSPACE_HOST = 'friendspace.example';

/** Friend pages (`/<contactId>`) are added from the profiles with `PROFILE_PAGE`. */
export const SITE_META: SiteMeta = {
  title: 'Friendspace: a place for friends in orbit',
  description:
    'Friendspace is the place for friends: profiles, Top 8, comments, moods and a song on your page. Join for free!',
  keywords: [
    'friendspace',
    'friends',
    'profile',
    'social',
    'top 8',
    'comments',
    'music',
  ],
  pages: {
    '/': {
      title: 'Friendspace - a place for friends in orbit',
      keywords: ['sign up', 'log in', 'cool new people'],
    },
    '/me': {
      title: 'Friendspace - My Profile',
      keywords: ['my profile', 'edit', 'me'],
    },
    '/bulletins': {
      title: 'Friendspace - Bulletins',
      keywords: ['bulletins', 'news', 'friends'],
    },
    '/*': { title: 'Friendspace - Lost in orbit' },
  },
};

/** A friend's profile page; `{name}` is the friend's name. */
export const PROFILE_PAGE = {
  title: '{name} on Friendspace',
  keywords: ['profile', 'top 8', 'comments'],
};

export const FRIENDSPACE_TEXT = {
  logo: 'Friendspace',
  tagline: 'a place for friends in orbit',
  welcome:
    'Friendspace is the place to meet your friends, share your music and show the whole galaxy how cool you are. Join for free!!',
  signUp: 'Sign Up!',
  logIn: 'Log In',
  coolNewPeople: 'Cool New People',
  news: [
    'NEW: put a song on your profile!! everyone who visits can hear it',
    'Pick your Top 8 wisely. your friends WILL notice',
    'Friendspace now has over 4,000,000 members in orbit!',
  ],
  footer:
    'About · FAQ · Terms · Privacy · ©2007 Friendspace. All rights reserved in orbit.',
  notFoundTitle: 'Lost in orbit!',
  notFoundText:
    'This profile has drifted off into space. Check the address, or go back to the launch pad.',
  emptyWall:
    'No comments yet. Be the first!! (once commenting comes back from space)',
  myEmptyWall: 'No comments yet. Your friends will find you soon!',
};

export interface ThemePreset {
  id: string;
  label: string;
  theme: ProfileTheme;
}

const COMIC = "'Comic Sans MS', 'Chalkboard', cursive";
const PLAIN = 'Verdana, Tahoma, sans-serif';

/** The six presets in the `/me` editor; `default` is Friendspace's own look. */
export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    id: 'default',
    label: 'Friendspace Classic',
    theme: {
      background: '#e5ecf9',
      text: '#000000',
      accent: '#336699',
      glitter: false,
      font: PLAIN,
      panel: '#ffffff',
    },
  },
  {
    id: 'glitter',
    label: 'Pink Glitter',
    theme: {
      background: 'linear-gradient(180deg, #ff9ecb, #ff5fa2)',
      text: '#5a0f2e',
      accent: '#e0157a',
      glitter: true,
      font: COMIC,
      panel: 'rgba(255, 240, 246, 0.92)',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    theme: {
      background: '#0b0b0b',
      text: '#d6d6d6',
      accent: '#8fd3c8',
      glitter: false,
      font: "Georgia, 'Times New Roman', serif",
      panel: '#161616',
    },
  },
  {
    id: 'pastel',
    label: 'Pastel Dream',
    theme: {
      background: 'linear-gradient(135deg, #ffe0f4, #e6d9ff, #d4f4ff)',
      text: '#4b2a66',
      accent: '#b47edb',
      glitter: true,
      font: COMIC,
      panel: 'rgba(255, 255, 255, 0.85)',
    },
  },
  {
    id: 'neon',
    label: 'Neon Rave',
    theme: {
      background:
        'repeating-linear-gradient(45deg, #ff2fd1 0 22px, #39ff14 22px 44px, #00e5ff 44px 66px)',
      text: '#1a0033',
      accent: '#d4009c',
      glitter: true,
      font: COMIC,
      panel: 'rgba(255, 255, 255, 0.9)',
    },
  },
  {
    id: 'outer-space',
    label: 'Outer Space',
    theme: {
      background: 'radial-gradient(circle at 30% 20%, #2b3a8c, #0a0f2e 70%)',
      text: '#e8ecff',
      accent: '#ffd23f',
      glitter: true,
      font: PLAIN,
      panel: 'rgba(10, 15, 46, 0.85)',
    },
  },
];

/** Moods the player can pick an emoticon for (codes are Messenger emoticon codes). */
export const MOOD_EMOTICONS: readonly { code: string; label: string }[] = [
  { code: ':)', label: 'happy' },
  { code: ':D', label: 'hyper' },
  { code: ';)', label: 'cheeky' },
  { code: ':P', label: 'silly' },
  { code: ':(', label: 'sad' },
  { code: ':O', label: 'shocked' },
  { code: '(Y)', label: 'awesome' },
  { code: '(N)', label: 'blah' },
  { code: '(L)', label: 'in love' },
  { code: '(8)', label: 'rockin' },
];

export const PROFILE_LIMITS = {
  headline: 60,
  mood: 24,
  aboutMe: 1000,
} as const;

/**
 * The player's `/me` until they save their own (`web.myProfile` is null): pink glitter for a girl,
 * midnight for a boy.
 */
export const DEFAULT_PLAYER_PROFILE: Omit<PlayerProfile, 'top8'> = {
  headline: g(
    'new 2 Friendspace!! ~*sparkle*~ <3',
    'new to Friendspace. skate all day',
  ),
  mood: { text: g('giggly', 'pumped'), emoticon: g(':D', '(8)') },
  aboutMe: g(
    'Hi!! <3 I just joined Friendspace. Click "Edit Profile" to tell the galaxy about yourself.',
    'Hey. I just joined Friendspace. Click "Edit Profile" to tell the galaxy about yourself.',
  ),
  songTrackId: null,
  themePreset: g('glitter', 'midnight'),
  customColors: null,
};
