// Content per locale (docs/i18n.md → "Content per locale"): every accessor returns the German
// module for 'de' and English otherwise. English is bundled; German lives in `de/bundle.ts`,
// loaded on demand by `loadLocale` (src/i18n/load.ts). Contacts merge a text overlay over the
// English module; everything else is a full German module of the same type.
import type { FsNode } from '@/os/fs/types';
import type { Locale } from '@/i18n/types';
import * as enAssistant from './assistant';
import * as enBalloons from './balloons';
import { contacts as enContacts } from './contacts';
import { SEED_FILES } from './files';
import { MAIL_CONTENT } from './mail';
import { autoReplies } from './mail/autoReplies';
import type { AutoReply, MailContent } from './mail/types';
import { PROFILES } from './profiles';
import type { ProfileContent } from './profiles/types';
import * as enAbout from './sites/about';
import * as enGossip from './sites/celebgossip07';
import * as enSearchly from './sites/searchly';
import * as enFriendspace from './sites/friendspace';
import * as enTinfoil from './sites/tinfoilcomets';
import * as enVirusguard from './sites/virusguard';
import * as enWestfield from './sites/westfieldhigh';
import * as enTuneMole from './tunemole';
import { loadedContent } from '@/i18n/load';
import type { ContactContent, TuneMoleResult } from './types';

export { mergeOverlay, overlayFallbacks } from './overlay';

/** Text modules of every site (each exports its `SITE_META`), by host. */
const EN_SITES = {
  [enAbout.ABOUT_HOST]: enAbout,
  [enSearchly.SEARCHLY_HOST]: enSearchly,
  [enGossip.GOSSIP_HOST]: enGossip,
  [enFriendspace.FRIENDSPACE_HOST]: enFriendspace,
  [enTinfoil.TINFOIL_HOST]: enTinfoil,
  [enVirusguard.VIRUSGUARD_HOST]: enVirusguard,
  [enWestfield.WESTFIELD_HOST]: enWestfield,
};

export type SiteTexts = typeof EN_SITES;
export type SiteTextHost = keyof SiteTexts;
export type BalloonContent = typeof enBalloons;
export type TipContent = typeof enAssistant;

/** Everything one locale ships; the German side must match the English types exactly. */
export interface LocaleContent {
  contacts: readonly ContactContent[];
  seedFiles: readonly FsNode[];
  mail: readonly MailContent[];
  autoReplies: readonly AutoReply[];
  profiles: readonly ProfileContent[];
  sites: SiteTexts;
  balloons: BalloonContent;
  tips: TipContent;
  tuneMole: readonly TuneMoleResult[];
}

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

const EN: LocaleContent = {
  contacts: enContacts,
  seedFiles: SEED_FILES,
  mail: MAIL_CONTENT,
  autoReplies,
  profiles: PROFILES,
  sites: EN_SITES,
  balloons: enBalloons,
  tips: enAssistant,
  tuneMole: enTuneMole.TUNEMOLE_RESULTS,
};

/** All content for `locale`: English, or a loaded language (English until it has loaded). */
export const contentFor = (locale: Locale): LocaleContent =>
  (locale !== 'en' && loadedContent(locale)) || EN;

/** Messenger contacts with their text in `locale`, in sign-in order. */
export const getContacts = (locale: Locale) => contentFor(locale).contacts;
export const getSeedFiles = (locale: Locale) => contentFor(locale).seedFiles;
export const getMailContent = (locale: Locale) => contentFor(locale).mail;
export const getAutoReplies = (locale: Locale) =>
  contentFor(locale).autoReplies;
export const getProfiles = (locale: Locale) => contentFor(locale).profiles;
export const getBalloons = (locale: Locale) => contentFor(locale).balloons;
export const getTips = (locale: Locale) => contentFor(locale).tips;
export const getTuneMoleResults = (locale: Locale) =>
  contentFor(locale).tuneMole;

/** One content-backed site's text module (`src/content/sites/<site>.ts`) in `locale`. */
export function getSiteText<H extends SiteTextHost>(
  host: H,
  locale: Locale,
): SiteTexts[H] {
  return contentFor(locale).sites[host];
}
