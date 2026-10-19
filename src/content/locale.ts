// Content per locale (docs/i18n.md → "Content per locale"): every accessor returns the German
// module for 'de' and English otherwise. English is bundled; German lives in `de/bundle.ts`,
// loaded on demand by `loadLocale` (src/i18n/load.ts). Contacts merge a text overlay over the
// English module; everything else is a full German module of the same type. Accessors resolve
// the gender variants (`g()`, docs/gender.md) for the player's gender; overlays merge before.
import type { FsNode } from '@/os/fs/types';
import type { Gender } from '@/os/types';
import type { Locale } from '@/i18n/types';
import * as enAssistant from './assistant';
import * as enBalloons from './balloons';
import { contacts as enContacts } from './contacts';
import { SEED_FILES } from './files';
import { BANDS } from './friendspace/bands';
import { BULLETINS } from './friendspace/bulletins';
import { TOP8_REACTIONS } from './friendspace/top8Reactions';
import type { Band, Bulletin, Top8Reaction } from './friendspace/types';
import { MAIL_CONTENT } from './mail';
import { autoReplies } from './mail/autoReplies';
import type { AutoReply, MailContent } from './mail/types';
import { PROFILES } from './friendspace/profiles';
import type { ProfileContent } from './friendspace/profiles/types';
import { PIXLOG_PROFILES } from './pixlog';
import { SURVEYS } from './pixlog/surveys';
import type { PixlogProfile, Survey } from './pixlog/types';
import * as enAbout from './sites/about';
import * as enGossip from './sites/celebgossip07';
import * as enCheatCave from './sites/cheatcave';
import * as enKickflip from './sites/kickflipkings';
import * as enSearchly from './sites/searchly';
import * as enFriendspace from './sites/friendspace';
import * as enGlitter from './sites/glittercodez';
import * as enPixlog from './sites/pixlog';
import type { LayoutDef } from './sites/glittercodez';
import * as enTinfoil from './sites/tinfoilcomets';
import * as enVirusguard from './sites/virusguard';
import * as enWestfield from './sites/westfieldhigh';
import * as enTuneMole from './tunemole';
import { loadedContent } from '@/i18n/load';
import { resolvedFor } from './gender';
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
  [enCheatCave.CHEATCAVE_HOST]: enCheatCave,
  [enKickflip.KICKFLIP_HOST]: enKickflip,
  [enGlitter.GLITTERCODEZ_HOST]: enGlitter,
  [enPixlog.PIXLOG_HOST]: enPixlog,
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
  /** Friendspace (v0.4). */
  bulletins: readonly Bulletin[];
  bands: readonly Band[];
  top8Reactions: readonly Top8Reaction[];
  /** Pixlog profiles, one per friend. */
  pixlog: readonly PixlogProfile[];
  surveys: readonly Survey[];
  /** GlitterCodez gallery layouts. */
  layouts: readonly LayoutDef[];
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
  bulletins: BULLETINS,
  bands: BANDS,
  top8Reactions: TOP8_REACTIONS,
  pixlog: PIXLOG_PROFILES,
  surveys: SURVEYS,
  layouts: enGlitter.LAYOUTS,
};

/**
 * All content for `locale` as authored, variants unresolved: English, or a loaded language
 * (English until it has loaded). For parity and lint; the game reads `contentFor`.
 */
export const rawContentFor = (locale: Locale): LocaleContent =>
  (locale !== 'en' && loadedContent(locale)) || EN;

/** All content for `locale`, resolved for `gender` (`null`, not chosen yet, reads as girl). */
export const contentFor = (
  locale: Locale,
  gender: Gender | null,
): LocaleContent => resolvedFor(rawContentFor(locale), gender ?? 'girl');

/** Messenger contacts with their text in `locale`, in sign-in order. */
export const getContacts = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).contacts;
export const getSeedFiles = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).seedFiles;
export const getMailContent = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).mail;
export const getAutoReplies = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).autoReplies;
export const getProfiles = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).profiles;
export const getBalloons = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).balloons;
export const getTips = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).tips;
export const getTuneMoleResults = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).tuneMole;
export const getBulletins = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).bulletins;
export const getBands = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).bands;
export const getTop8Reactions = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).top8Reactions;
export const getPixlogProfiles = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).pixlog;
export const getSurveys = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).surveys;
export const getLayouts = (locale: Locale, gender: Gender | null) =>
  contentFor(locale, gender).layouts;

/** One content-backed site's text module (`src/content/sites/<site>.ts`) in `locale`. */
export function getSiteText<H extends SiteTextHost>(
  host: H,
  locale: Locale,
  gender: Gender | null,
): SiteTexts[H] {
  return contentFor(locale, gender).sites[host];
}
