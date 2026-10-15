// Content per locale (docs/i18n.md → "Content per locale"): every accessor returns the German
// module for 'de' and English otherwise. Contacts merge a text overlay over the English module;
// everything else is a full German module of the same type (re-exports of English until P2).
import type { FsNode } from '@/os/fs/types';
import type { Locale } from '@/i18n/types';
import * as enAssistant from './assistant';
import * as enBalloons from './balloons';
import { contacts as enContacts } from './contacts';
import * as deAssistant from './de/assistant';
import * as deBalloons from './de/balloons';
import { contactOverlays } from './de/contacts';
import * as deFiles from './de/files';
import * as deMail from './de/mail';
import * as deProfiles from './de/profiles';
import * as deGossip from './de/sites/celebgossip07';
import * as deSpaceport from './de/sites/spaceport';
import * as deTinfoil from './de/sites/tinfoilcomets';
import * as deVirusguard from './de/sites/virusguard';
import * as deWestfield from './de/sites/westfieldhigh';
import * as deTuneMole from './de/tunemole';
import { SEED_FILES } from './files';
import { MAIL_CONTENT } from './mail';
import { autoReplies } from './mail/autoReplies';
import type { AutoReply, MailContent } from './mail/types';
import { PROFILES } from './profiles';
import type { ProfileContent } from './profiles/types';
import * as enGossip from './sites/celebgossip07';
import * as enSpaceport from './sites/spaceport';
import * as enTinfoil from './sites/tinfoilcomets';
import * as enVirusguard from './sites/virusguard';
import * as enWestfield from './sites/westfieldhigh';
import * as enTuneMole from './tunemole';
import type {
  Choice,
  ContactContent,
  ContactLine,
  ContactOverlay,
  NodeOverlay,
  Script,
  ScriptNode,
  TuneMoleResult,
} from './types';

/** Text modules of the content-backed sites, by host. */
const EN_SITES = {
  [enGossip.GOSSIP_HOST]: enGossip,
  [enSpaceport.SPACEPORT_HOST]: enSpaceport,
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

/** The German overlays by contact id; `getContacts('de')` merges them over English. */
export const CONTACT_OVERLAYS: Readonly<Record<string, ContactOverlay>> =
  contactOverlays;

// ---------------------------------------------------------------------------
// Overlay merge
// ---------------------------------------------------------------------------

/** Overlay text, or `undefined` when it is missing/empty (the English text is used). */
const given = (text: string | undefined): string | undefined =>
  text === undefined || text === '' ? undefined : text;

function mergeLine(
  line: ContactLine,
  index: number,
  node: NodeOverlay | undefined,
): ContactLine {
  const text = line.text === undefined ? undefined : given(node?.lines[index]);
  const pm =
    line.personalMessageChange === undefined
      ? undefined
      : given(node?.personalMessages?.[index]);
  if (text === undefined && pm === undefined) return line;
  return {
    ...line,
    ...(text !== undefined ? { text } : {}),
    ...(pm !== undefined ? { personalMessageChange: pm } : {}),
  };
}

function mergeChoice(
  choice: Choice,
  index: number,
  node: NodeOverlay | undefined,
): Choice {
  const over = node?.choices?.[index];
  const text = given(over?.text);
  const label = given(over?.label);
  if (text === undefined && label === undefined) return choice;
  return {
    ...choice,
    ...(text !== undefined ? { text } : {}),
    ...(label !== undefined ? { label } : {}),
  };
}

function mergeNode(
  node: ScriptNode,
  over: NodeOverlay | undefined,
): ScriptNode {
  if (!over) return node;
  const lines = node.lines.map((l, i) => mergeLine(l, i, over));
  if (!('choices' in node)) return { ...node, lines };
  return {
    ...node,
    lines,
    choices: node.choices.map((c, i) =>
      mergeChoice(c, i, over),
    ) as unknown as typeof node.choices,
  };
}

function mergeScript(script: Script, overlay: ContactOverlay): Script {
  const nodes = overlay.scripts[script.id];
  if (!nodes) return script;
  return {
    ...script,
    nodes: Object.fromEntries(
      Object.entries(script.nodes).map(([id, node]) => [
        id,
        mergeNode(node, nodes[id]),
      ]),
    ),
  };
}

/**
 * A full contact in the overlay's language: only text is replaced, and any text the overlay
 * lacks stays English. Delays, triggers, actions and the node graph always come from `content`.
 */
export function mergeOverlay(
  content: ContactContent,
  overlay: ContactOverlay | undefined,
): ContactContent {
  if (!overlay) return content;
  const { contact } = content;
  const days = contact.days
    ? Object.fromEntries(
        Object.entries(contact.days).map(([day, presence]) => {
          const pm =
            presence?.personalMessage === undefined
              ? undefined
              : given(overlay.days?.[Number(day)]?.personalMessage);
          return [
            day,
            pm === undefined ? presence : { ...presence, personalMessage: pm },
          ];
        }),
      )
    : undefined;
  const awayReply =
    contact.awayReply === undefined ? undefined : given(overlay.awayReply);
  return {
    contact: {
      ...contact,
      displayName: given(overlay.displayName) ?? contact.displayName,
      personalMessage:
        given(overlay.personalMessage) ?? contact.personalMessage,
      ...(days ? { days } : {}),
      ...(awayReply !== undefined ? { awayReply } : {}),
    },
    scripts: content.scripts.map((s) => mergeScript(s, overlay)),
  };
}

/**
 * Paths of every English text a merge would fall back to (empty = fully translated). For tests
 * and the P2 fallback check; `displayName` is optional and never reported.
 */
export function overlayFallbacks(
  content: ContactContent,
  overlay: ContactOverlay | undefined,
): string[] {
  const id = content.contact.id;
  const out: string[] = [];
  const miss = (text: string | undefined, path: string) => {
    if (given(text) === undefined) out.push(`${id}.${path}`);
  };
  miss(overlay?.personalMessage, 'personalMessage');
  if (content.contact.awayReply !== undefined)
    miss(overlay?.awayReply, 'awayReply');
  for (const [day, presence] of Object.entries(content.contact.days ?? {})) {
    if (presence?.personalMessage !== undefined)
      miss(
        overlay?.days?.[Number(day)]?.personalMessage,
        `days.${day}.personalMessage`,
      );
  }
  for (const script of content.scripts) {
    for (const [nodeId, node] of Object.entries(script.nodes)) {
      const over = overlay?.scripts[script.id]?.[nodeId];
      const at = `${script.id}.${nodeId}`;
      node.lines.forEach((line, i) => {
        if (line.text !== undefined) miss(over?.lines[i], `${at}.lines[${i}]`);
        if (line.personalMessageChange !== undefined)
          miss(over?.personalMessages?.[i], `${at}.personalMessages[${i}]`);
      });
      if ('choices' in node)
        node.choices.forEach((choice, i) => {
          miss(over?.choices?.[i]?.text, `${at}.choices[${i}].text`);
          if (choice.label !== undefined)
            miss(over?.choices?.[i]?.label, `${at}.choices[${i}].label`);
        });
    }
  }
  return out;
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

const DE: LocaleContent = {
  contacts: enContacts.map((c) =>
    mergeOverlay(c, CONTACT_OVERLAYS[c.contact.id]),
  ),
  seedFiles: deFiles.SEED_FILES,
  mail: deMail.MAIL_CONTENT,
  autoReplies: deMail.autoReplies,
  profiles: deProfiles.PROFILES,
  sites: {
    [enGossip.GOSSIP_HOST]: deGossip,
    [enSpaceport.SPACEPORT_HOST]: deSpaceport,
    [enTinfoil.TINFOIL_HOST]: deTinfoil,
    [enVirusguard.VIRUSGUARD_HOST]: deVirusguard,
    [enWestfield.WESTFIELD_HOST]: deWestfield,
  },
  balloons: deBalloons,
  tips: deAssistant,
  tuneMole: deTuneMole.TUNEMOLE_RESULTS,
};

/** All content for `locale` (German for 'de', English otherwise). */
export const contentFor = (locale: Locale): LocaleContent =>
  locale === 'de' ? DE : EN;

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
