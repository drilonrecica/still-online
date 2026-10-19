import { describe, expect, it } from 'vitest';
import { contentFor, type LocaleContent } from './locale';
import { lintSocial } from './lintSocial';

const en = contentFor('en', 'girl');
const broken = (patch: Partial<LocaleContent>) =>
  lintSocial({ ...en, ...patch });

describe('lintSocial', () => {
  it('passes the shipped content', () => {
    expect(lintSocial(en)).toEqual([]);
  });

  it('flags days outside the story, unknown contacts and non-.example links', () => {
    const b = en.bulletins[0]!;
    expect(
      broken({
        bulletins: [
          {
            ...b,
            day: 11,
            from: { contactId: 'ghost' },
            link: 'http://x.com/',
          },
        ],
      }),
    ).toEqual([
      `bulletins.${b.id}: day 11 is outside days 1–10`,
      `bulletins.${b.id}: unknown contact "ghost"`,
      `bulletins.${b.id}: link "http://x.com/" is not an http://….example URL`,
    ]);
  });

  it('flags off-playlist band tracks and unknown Top 8 bands', () => {
    const band = en.bands[0]!;
    expect(broken({ bands: [{ ...band, trackIds: ['nope'] }] })).toContain(
      `bands.${band.id}: track "nope" isn't on the playlist`,
    );
    const p = en.profiles[0]!;
    expect(
      broken({
        profiles: [{ ...p, top8: [{ kind: 'band', id: 'no-band' }] }],
      }),
    ).toEqual([`profiles.${p.contactId}: unknown band "no-band" in Top 8`]);
  });

  it('flags Pixlog survey mismatches and comments before the album', () => {
    const p = en.pixlog[0]!;
    const album = p.albums[0]!;
    const photo = album.photos[0]!;
    const problems = broken({
      pixlog: [
        {
          ...p,
          survey: { surveyId: p.survey.surveyId, answers: ['one'] },
          albums: [
            {
              ...album,
              day: 3,
              photos: [
                { ...photo, comments: [{ day: 2, from: 'x', text: 'y' }] },
              ],
            },
          ],
        },
      ],
    });
    expect(problems).toContain(
      `pixlog.${p.contactId}: survey answers don't match the questions`,
    );
    expect(problems).toContain(
      `pixlog.${p.contactId}.${album.id}.photos[0].comments[0]: before the album's day`,
    );
  });

  it('flags layouts outside the fixed sets', () => {
    const l = en.layouts[0]!;
    expect(
      broken({
        layouts: [
          {
            ...l,
            side: 'both' as never,
            extras: {
              background: 'url(x)' as never,
              text: 'red',
              stickers: [{ id: 'star', pos: 'middle' as never }],
            },
          },
        ],
      }),
    ).toEqual([
      `layouts.${l.id}: unknown side`,
      `layouts.${l.id}: unknown background`,
      `layouts.${l.id}: text is not #rgb/#rrggbb`,
      `layouts.${l.id}: unknown sticker star middle`,
    ]);
  });

  it("flags a friend profile's layout outside the fixed sets", () => {
    const p = en.profiles[0]!;
    expect(
      broken({
        profiles: [
          { ...p, layout: { cursor: 'laser' as never, stickers: [] } },
        ],
      }),
    ).toEqual([`profiles.${p.contactId}.layout: unknown cursor`]);
  });

  it('flags duplicate ids and stray placeholders', () => {
    const r = en.top8Reactions[0]!;
    expect(
      broken({ top8Reactions: [r, { ...r, dropped: 'bye {who}' }] }),
    ).toEqual([
      `top8Reactions: duplicate ids ${r.contactId}`,
      `top8Reactions.${r.contactId}: unknown placeholder {who}`,
    ]);
  });
});
