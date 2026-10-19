// Structural lint for the v0.4 content (Friendspace bulletins/bands/Top 8 reactions, Pixlog,
// surveys, GlitterCodez layouts): ids resolve, days stay within the story, layouts only use the
// fixed sets. The text itself goes through the shared lint in `content.test.ts`.
import {
  BACKGROUND_IDS,
  CURSOR_IDS,
  FONT_IDS,
  MAX_STICKERS,
  STICKER_IDS,
  STICKER_POSITIONS,
  type LayoutExtras,
} from './friendspace/layoutSets';
import { GENDERS } from './gender';
import type { LocaleContent } from './locale';
import { PIXLOG_SKINS } from './pixlog/types';
import { PLAYLIST } from './playlist';

const STORY_DAYS = { first: 1, last: 5 } as const;
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const EXAMPLE_URL = /^http:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.example(?:\/\S*)?$/;
const PLACEHOLDER = /\{[^}]*\}/g;

const has = (set: readonly string[], v: string | undefined) =>
  v === undefined || set.includes(v);

function layoutProblems(x: LayoutExtras, at: string): string[] {
  const out: string[] = [];
  if (!has(BACKGROUND_IDS, x.background)) out.push(`${at}: unknown background`);
  if (!has(FONT_IDS, x.font)) out.push(`${at}: unknown font`);
  if (!has(CURSOR_IDS, x.cursor)) out.push(`${at}: unknown cursor`);
  for (const key of ['text', 'accent'] as const)
    if (x[key] !== undefined && !HEX.test(x[key]))
      out.push(`${at}: ${key} is not #rgb/#rrggbb`);
  if (x.panel !== undefined && x.panel !== 'none' && !HEX.test(x.panel))
    out.push(`${at}: panel is not a colour or none`);
  if (x.stickers.length > MAX_STICKERS) out.push(`${at}: too many stickers`);
  for (const s of x.stickers)
    if (!has(STICKER_IDS, s.id) || !has(STICKER_POSITIONS, s.pos))
      out.push(`${at}: unknown sticker ${s.id} ${s.pos}`);
  return out;
}

/** Problems with one locale's v0.4 content; empty when everything resolves. */
export function lintSocial(c: LocaleContent): string[] {
  const out: string[] = [];
  const contactIds = new Set(c.contacts.map((x) => x.contact.id));
  const bandIds = new Set(c.bands.map((b) => b.id));
  const trackIds = new Set(PLAYLIST.map((t) => t.id));
  const day = (d: number, at: string) => {
    if (!Number.isInteger(d) || d < STORY_DAYS.first || d > STORY_DAYS.last)
      out.push(`${at}: day ${d} is outside days 1–5`);
  };
  const contact = (id: string, at: string) => {
    if (!contactIds.has(id)) out.push(`${at}: unknown contact "${id}"`);
  };
  const unique = (ids: readonly string[], at: string) => {
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) out.push(`${at}: duplicate ids ${dupes.join(', ')}`);
  };

  unique(
    c.bulletins.map((b) => b.id),
    'bulletins',
  );
  for (const b of c.bulletins) {
    const at = `bulletins.${b.id}`;
    day(b.day, at);
    if ('contactId' in b.from) contact(b.from.contactId, at);
    if (b.link !== undefined && !EXAMPLE_URL.test(b.link))
      out.push(`${at}: link "${b.link}" is not an http://….example URL`);
  }

  unique([...bandIds], 'bands');
  for (const b of c.bands) {
    const at = `bands.${b.id}`;
    if (b.trackIds.length === 0) out.push(`${at}: no tracks`);
    for (const t of b.trackIds)
      if (!trackIds.has(t))
        out.push(`${at}: track "${t}" isn't on the playlist`);
    b.shows.forEach((s, i) => day(s.day, `${at}.shows[${i}]`));
    b.blog.forEach((p, i) => day(p.day, `${at}.blog[${i}]`));
  }

  unique(
    c.top8Reactions.map((r) => r.contactId),
    'top8Reactions',
  );
  for (const r of c.top8Reactions) {
    contact(r.contactId, `top8Reactions.${r.contactId}`);
    for (const text of [r.dropped, r.readded])
      for (const p of text.match(PLACEHOLDER) ?? [])
        if (p !== '{name}')
          out.push(`top8Reactions.${r.contactId}: unknown placeholder ${p}`);
  }

  for (const p of c.profiles) {
    for (const t of p.top8)
      if (t.kind === 'band' && !bandIds.has(t.id))
        out.push(`profiles.${p.contactId}: unknown band "${t.id}" in Top 8`);
    if (p.layout)
      out.push(...layoutProblems(p.layout, `profiles.${p.contactId}.layout`));
  }

  unique(
    c.surveys.map((s) => s.id),
    'surveys',
  );
  unique(
    c.pixlog.map((p) => p.contactId),
    'pixlog',
  );
  unique(
    c.pixlog.flatMap((p) => p.albums.map((a) => a.id)),
    'pixlog albums',
  );
  for (const p of c.pixlog) {
    const at = `pixlog.${p.contactId}`;
    contact(p.contactId, at);
    if (!has(PIXLOG_SKINS, p.skin)) out.push(`${at}: unknown skin`);
    for (const a of p.albums) {
      day(a.day, `${at}.${a.id}`);
      a.photos.forEach((ph, i) =>
        ph.comments.forEach((cm, j) => {
          const where = `${at}.${a.id}.photos[${i}].comments[${j}]`;
          day(cm.day, where);
          if (cm.day < a.day) out.push(`${where}: before the album's day`);
        }),
      );
    }
    p.blog.forEach((b) => day(b.day, `${at}.blog.${b.id}`));
    p.shouts.forEach((s, i) => day(s.day, `${at}.shouts[${i}]`));
    p.kudosToPlayer.forEach((d, i) => day(d, `${at}.kudosToPlayer[${i}]`));
    p.guestbook.forEach((g, i) => day(g.day, `${at}.guestbook[${i}]`));
    const survey = c.surveys.find((s) => s.id === p.survey.surveyId);
    if (!survey) out.push(`${at}: unknown survey "${p.survey.surveyId}"`);
    else if (survey.questions.length !== p.survey.answers.length)
      out.push(`${at}: survey answers don't match the questions`);
  }

  unique(
    c.layouts.map((l) => l.id),
    'layouts',
  );
  for (const l of c.layouts) {
    if (!has(GENDERS, l.side)) out.push(`layouts.${l.id}: unknown side`);
    out.push(...layoutProblems(l.extras, `layouts.${l.id}`));
  }
  return out;
}
