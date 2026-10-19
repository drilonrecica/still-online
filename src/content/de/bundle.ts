// Everything German in one lazily loaded chunk: the UI catalog and all content. Only
// `loadLocale('de')` (src/i18n/load.ts) imports this, dynamically; tests may import it directly.
import { de } from '@/i18n/messages/de';
import { contacts as enContacts } from '../contacts';
import type { LocaleContent } from '../locale';
import { mergeOverlay } from '../overlay';
import { ABOUT_HOST } from '../sites/about';
import { GOSSIP_HOST } from '../sites/celebgossip07';
import { CHEATCAVE_HOST } from '../sites/cheatcave';
import { GLITTERCODEZ_HOST } from '../sites/glittercodez';
import { PIXLOG_HOST } from '../sites/pixlog';
import { KICKFLIP_HOST } from '../sites/kickflipkings';
import { SEARCHLY_HOST } from '../sites/searchly';
import { FRIENDSPACE_HOST } from '../sites/friendspace';
import { TINFOIL_HOST } from '../sites/tinfoilcomets';
import { VIRUSGUARD_HOST } from '../sites/virusguard';
import { WESTFIELD_HOST } from '../sites/westfieldhigh';
import type { ContactOverlay } from '../types';
import * as assistant from './assistant';
import * as balloons from './balloons';
import { contactOverlays } from './contacts';
import * as files from './files';
import { BANDS } from './friendspace/bands';
import { BULLETINS } from './friendspace/bulletins';
import { TOP8_REACTIONS } from './friendspace/top8Reactions';
import * as mail from './mail';
import { PIXLOG_PROFILES } from './pixlog';
import { SURVEYS } from './pixlog/surveys';
import * as profiles from './friendspace/profiles';
import * as about from './sites/about';
import * as gossip from './sites/celebgossip07';
import * as cheatcave from './sites/cheatcave';
import * as kickflip from './sites/kickflipkings';
import * as searchly from './sites/searchly';
import * as friendspace from './sites/friendspace';
import * as glitter from './sites/glittercodez';
import * as pixlog from './sites/pixlog';
import * as tinfoil from './sites/tinfoilcomets';
import * as virusguard from './sites/virusguard';
import * as westfield from './sites/westfieldhigh';
import * as tuneMole from './tunemole';

export const catalog = de;

/** The German overlays by contact id; `getContacts('de')` merges them over English. */
export const CONTACT_OVERLAYS: Readonly<Record<string, ContactOverlay>> =
  contactOverlays;

export const content: LocaleContent = {
  contacts: enContacts.map((c) =>
    mergeOverlay(c, CONTACT_OVERLAYS[c.contact.id]),
  ),
  seedFiles: files.SEED_FILES,
  mail: mail.MAIL_CONTENT,
  autoReplies: mail.autoReplies,
  profiles: profiles.PROFILES,
  sites: {
    [ABOUT_HOST]: about,
    [SEARCHLY_HOST]: searchly,
    [GOSSIP_HOST]: gossip,
    [FRIENDSPACE_HOST]: friendspace,
    [TINFOIL_HOST]: tinfoil,
    [VIRUSGUARD_HOST]: virusguard,
    [WESTFIELD_HOST]: westfield,
    [CHEATCAVE_HOST]: cheatcave,
    [KICKFLIP_HOST]: kickflip,
    [GLITTERCODEZ_HOST]: glitter,
    [PIXLOG_HOST]: pixlog,
  },
  balloons,
  tips: assistant,
  tuneMole: tuneMole.TUNEMOLE_RESULTS,
  bulletins: BULLETINS,
  bands: BANDS,
  top8Reactions: TOP8_REACTIONS,
  pixlog: PIXLOG_PROFILES,
  surveys: SURVEYS,
  layouts: glitter.LAYOUTS,
};
