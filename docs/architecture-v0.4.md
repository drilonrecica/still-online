# still online — v0.4 architecture (Friendspace, Pixlog, GlitterCodez)

Extends `architecture.md` and `architecture-v0.2.md`; gender is in `gender.md`, i18n in `i18n.md`. Written in P0-02 and kept up to date by each later task; as of the v0.4.0 release it matches what was built. Design: `docs/superpowers/specs/2026-10-15-v04-social-design.md`.

## Where things live

| What                                                                            | Where                                                                        |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Friendspace content types (bulletins, bands, Top 8 reactions, `PlayerTopEntry`) | `src/content/friendspace/types.ts`                                           |
| Friend profiles (moved from `src/content/profiles/`)                            | `src/content/friendspace/profiles/` (+ `de/friendspace/profiles/`)           |
| Bulletins · bands · Top 8 wall lines                                            | `src/content/friendspace/{bulletins,bands,top8Reactions}.ts`                 |
| Layout-code fixed sets (ids only)                                               | `src/content/friendspace/layoutSets.ts`                                      |
| Pixlog types · profiles (one module per friend) · surveys                       | `src/content/pixlog/{types,index,<friend>,surveys}.ts`                       |
| GlitterCodez host + `LayoutDef` + `LAYOUTS`                                     | `src/content/sites/glittercodez.ts`                                          |
| German twins (written in P4)                                                    | same paths under `src/content/de/`, wired in `de/bundle.ts`                  |
| `web` store v0.4 fields and actions                                             | `src/apps/browser/store.ts`; sanitizers in `src/apps/browser/webSanitize.ts` |
| Structural lint of the v0.4 content                                             | `src/content/lintSocial.ts` (run per locale × gender in `content.test.ts`)   |

Player gender (girl/boy, User Accounts, CheatCave, Kickflip Kings, per-gender files, chats, mail and favorites) is documented in `gender.md` and `architecture-v0.2.md`; this file covers the social sites. Site code goes in `src/apps/browser/sites/{friendspace,pixlog,glittercodez}/`. Sites never import Messenger or Amplifier; they talk through `src/os/events.ts`.

## Content types

**Friendspace** (`friendspace/types.ts`, `friendspace/profiles/types.ts`):

- `BandId = string` (`'tinfoil-comets'`, …).
- `Bulletin { id; day; from: { contactId } | { extra; seed }; subject; body; link? }`. `body` may use `rich.tsx` markup and `{name}`; `link` is an `http://….example` URL.
- `Band { id; name; genre; hometown; bio; trackIds (playlist ids); shows: {day,text}[]; blog: {day,title,body}[]; theme: ProfileTheme }`.
- `Top8Reaction { contactId; dropped; readded }`: the wall lines (may use `{name}`).
- `TopFriend` (friends' Top 8) gains `{ kind: 'band'; id: BandId }`. `ProfileComment` gains `graphic?: 'thanks' | 'hug' | 'glitterheart'` (`CommentGraphic`).
- `PlayerTopEntry = {kind:'contact',id} | {kind:'band',id} | {kind:'extra',name,seed}` — the player's Top 8.

**Pixlog** (`pixlog/types.ts`):

- `PixlogSkinId` from `PIXLOG_SKINS`: `orange`, `ocean`, `bubblegum`, `lime`, `night`, `sunset`.
- `PixlogPhoto { photo: PhotoSpec (caption inside); comments: {day, from: ContactId | extra name, text}[] }`.
- `PixlogAlbum { id; day; title; photos }` · `Survey { id; title; questions }`.
- `PixlogProfile { contactId; skin; about; albums; blog: {id,day,title,body}[]; survey: {surveyId, answers}; shouts: {day,text}[]; kudosToPlayer: number[] (days); guestbook: {day, from, text}[] }`.

**GlitterCodez** (`sites/glittercodez.ts`): `LayoutDef { id; name; blurb; side: Gender; extras: LayoutExtras }`. `side` says girly or boyish; the gallery puts the player's side first and hides nothing.

**Rules** (enforced by `lintSocial`, parity and the text lint): every `day` is 1–5; contact, band, track and survey ids resolve; ids are unique; a photo comment is not older than its album; survey answers match the question count; layouts use only the fixed sets and `#rgb`/`#rrggbb`; `side` is `girl` or `boy`. Text addressed to or about the player uses `g()` (a boy has no crush).

## Locale and gender wiring

`LocaleContent` gains `bulletins`, `bands`, `top8Reactions`, `pixlog`, `surveys` and `layouts`. Accessors take `(locale, gender)` like the rest: `getBulletins`, `getBands`, `getTop8Reactions`, `getPixlogProfiles`, `getSurveys`, `getLayouts` (`src/content/locale.ts`), all through `contentFor(locale, gender)`, which resolves `g()`/`gendered()` once per locale and gender.

German: each module has a twin under `src/content/de/**`, written in German in P4 (not a clone of English), reachable only through `de/bundle.ts` (lazy). `parity.test.ts` compares the raw modules deeply with `deepParityProblems`: same array lengths, keys, numbers and ids (`id`, `contactId`, `surveyId`, `seed`, `link`, `scene`, `skin`, `side`, `kind`, `pos`, `trackIds`, `extras`) and the same placeholders; only wording may differ. Gender parity (`genderParityProblems`) covers the new modules with the rest of `contentFor`.

## Saved state (`web` store, key `still-online:v1:web`)

`STORAGE_VERSION` is not bumped. Every new field is optional, absent until the player uses it, and has its own sanitizer in `webSanitize.ts` that falls back to the default on bad data (a v0.3 save loads unchanged: `src/test/v03-web-migration.test.ts` with `src/test/fixtures/v03-web.json`).

| Field                                                   | Shape                                                                                                             | Sanitizer · limits                                                                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `myProfile.headline?` `mood?` `aboutMe?` `themePreset?` | only what the player typed (v0.4.1); absent = the default at render (`effectiveProfile`)                          | `sanitizeProfile`: a v0.4 default text (`legacyProfile.ts`) → absent                                                    |
| `myProfile.top8`                                        | `PlayerTopEntry[]` (was `ContactId[]`)                                                                            | `sanitizeTop8`: a v0.3 string id → `{kind:'contact',id}`; unknown kinds/ids dropped; deduped; ≤ 8                       |
| `myProfile.layoutCode?`                                 | string, parsed at render                                                                                          | `sanitizeLayoutCode`: ≤ 2000 chars                                                                                      |
| `myProfile.autoplay?`                                   | boolean (absent = on)                                                                                             | `sanitizeAutoplay`                                                                                                      |
| `myProfile.moodHistory?`                                | `{text, emoticon, day}[]`, newest first                                                                           | `sanitizeMoodHistory`: ≤ 5                                                                                              |
| `bulletinsSeen?`                                        | highest day `/bulletins` was opened                                                                               | `sanitizeBulletinsSeen`: integer ≥ 1                                                                                    |
| `top8Wall?`                                             | `{contactId, kind:'dropped'\|'readded', day}[]`, oldest first                                                     | `sanitizeTop8Wall`: known contacts; ≤ 50 (oldest drop off)                                                              |
| `pixlog?`                                               | `{ skin?; album: {fsNodeId, caption}[]; surveys: Record<id, string[]>; kudosGiven: Record<ContactId, number[]> }` | `sanitizePixlog`: each part on its own; album ≤ 24, deduped, captions ≤ 80; answers ≤ 80; kudos days deduped and sorted |

`pixlog.skin` is absent until the player picks one; `pixlogSkinFor(pixlog, gender)` reads it, defaulting to `bubblegum` (girl) or `night` (boy), so an untouched skin follows a gender switch like favorites do.

**Actions:** `saveProfile` (widened to the new profile shape), `markBulletinsSeen(day)` (only raises), `appendTop8Wall(entry)`, `setPixlogSkin`, `setAlbum`, `saveSurvey(surveyId, answers)`, `giveKudos(contactId, day)` (false if already given to that friend that day, or an unknown friend). Persisted text is only what the player typed (captions, answers, layout code, mood); everything else is ids and days.

Top 8 reaction **bookkeeping** (`top8: Record<ContactId, {state, day}>`) lives in the Messenger store (P0-03), not here: `progress.top8` (`still-online:v1:messenger`, absent when empty, sanitized by `sanitizeTop8Records`). Both Top 8 events are routed by boot-installed listeners (`apps/messenger/top8Route.ts`, `apps/browser/top8WallRoute.ts`) that load the lazy Messenger runtime or `web` store only when an event arrives, so a drop counts even before Messenger was ever opened.

## Events (`src/os/events.ts`)

| Event                                                     | Payload                                        | From → to                               | Task  |
| --------------------------------------------------------- | ---------------------------------------------- | --------------------------------------- | ----- |
| `web:top8Changed`                                         | `{ dropped: ContactId[]; added: ContactId[] }` | `saveProfile` → Messenger runtime       | P0-03 |
| `messenger:top8Reacted`                                   | `{ contactId; kind: 'dropped' \| 'readded' }`  | Messenger → `web.appendTop8Wall`        | P0-03 |
| `amplifier:enqueue` (existing)                            | `{ trackId; play?; quiet? }`                   | band player, autoplay → Amplifier       | P1-02 |
| `amplifier:control`                                       | `{ action: 'pause' \| 'resume' \| 'stop' }`    | band player, song strip ■ → Amplifier   | P1-02 |
| `amplifier:trackChanged` / `amplifier:stopped` (existing) |                                                | Amplifier → band player, autoplay guard | P1-02 |
| `amplifier:progress`                                      | `{ trackId; position; duration; playing }`     | Amplifier → band player                 | P1-02 |

**Player state for sites** (P1-02): `src/os/nowPlaying.ts` mirrors the Amplifier from `trackChanged`/`stopped`/`progress` (`track`, `playing`, `position`, `duration`). `progress` is needed because the older events never report a pause; it fires on each whole second while playing and on every play/pause switch. The band player and song strip read the mirror. Autoplay (`friendspace/useProfileAutoplay.ts`, friend and band pages, once per page view) needs `!settings.muted`, `!playing` (a paused track may be replaced) and `myProfile.autoplay !== false`; it sends `quiet: true`, so `os/amplifierRouter.ts` plays the song without opening the Amplifier window. `amplifier:control` `resume` only continues a paused track.

New triggers `onTop8Dropped` (the day after a drop, on sign-in) and `onTop8Readded` go in `src/content/types.ts` (P0-03).

## Routes

**Friendspace** (`friendspace.example`; `spaceport.example` redirects, P0-01): `/` home · `/me` (editor, Top 8, wall with `top8Wall` reactions, mood history, bulletin box) · `/<friend>` (one fixed path per profile) · `/bulletins` (P1-01) · `/band/<id>` (one fixed path per band, P1-02) · `/*` "Lost in orbit!".

**GlitterCodez** (`glittercodez.example`, P1-04): `/` gallery (player's side first, then "more layouts"; each tile has a preview, its code and Copy) · `/glitter` · `/stickers` · `/cursors`.

**Pixlog** (`pixlog.example`, P2-01…P2-03): `/` splash + shouts feed · `/<friend>?tab=profile|photos|blog|surveys|guestbook` · `/album?id=<albumId>` · `/me` (kudos received, visitors, album, surveys, skin picker).

## Layout codes (summary; P1-03 owns the parser)

A made-up markup, never CSS or HTML, parsed by a total `parseLayoutCode` (`sites/friendspace/layoutCode.ts`) and written by `layoutCodeFor(extras, name?)`:

```
<!-- GlitterCodez.example layout: Starry Night -->
[layout bg=starry text=#fff accent=#fc0 panel=none font=comic glitter=on]
[cursor sparkle]
[sticker star top-right]
```

Values come only from the fixed sets in `layoutSets.ts` (12 backgrounds, 6 fonts, 9 stickers, 4 positions, 4 cursors; ≤ 4 stickers) plus `#rgb`/`#rrggbb`. Unknown input is ignored. Nothing else reaches a `style`, and nothing is rendered as HTML.

**Rendering (P1-03):** `layoutStyles.ts` maps the ids to CSS backgrounds and font stacks; `applyLayout(theme, extras)` lays the extras over a profile's theme (`/me`: `playerTheme`; friends: their `theme` plus the optional `ProfileContent.layout`). `ProfileView` then draws the glitter headline (whenever the effective theme has `glitter`; static under reduced motion), corner stickers (`src/assets/stickers/`), the cursor trail (`CursorTrail.tsx`: ≤ 12 nodes, 40 ms throttle, profile frame only, off under reduced motion), comment graphics (`graphic` on friends' comments and on `commentsOnPlayer`) and, on `/me`, the mood history. The editor's live preview is `LayoutPreview`, reusable by GlitterCodez tiles. Parsed colours are lowercased; `layoutCodeFor` writes them that way.

## Derived Pixlog feed and visitors (P2-02)

Pure functions in `sites/pixlog/logic.ts`, not saved. `shoutsFeed(profiles, day)`: friends' shouts plus `album` (id, title, photo count) and `blog` (id, title) items for content out by `day`, newest day first, content order within a day; the locale comes in through the profiles. The album/blog lines are worded at render by the catalog (`sites.pixlog.feed.*`), so they follow the language. `visitors(profiles, day, strangers)`: ≤ 8, every friend active on Pixlog that day (own shout/album/post, or a guestbook entry or photo comment they wrote) plus 1–3 seeded strangers, shuffled, all from `mulberry32(seedFrom('pixlog:visitors:' + day))`; strangers are `LocaleContent.pixlogStrangers` (`STRANGERS` in `pixlog/index.ts`, German twin). `recentVisitors` folds days `day…1` into the box list (each visitor once, latest day, ≤ 8). `visitorCount(day)`: 23 + a seeded 3–14 per day, so it only grows. UI: `Feed` (newest 20 lines) and `VisitorsBox` (counter, pictures, names, day labels) on `/`; P2-03 reuses `VisitorsBox` on `/me`. Kudos received = friends' `kudosToPlayer` days ≤ today.

## Pixlog shell (P2-01)

`sites/pixlog/`: `Layout` (orange bar, shutter-"o" wordmark; `data-skin` recolours bar and tabs, six skins in `Pixlog.module.css`), `Home` (login splash → `/me`, shouts feed, visitors box), `Friend` (one fixed path per Pixlog profile plus the `/*` catch-all, tabs via `?tab=`, unknown values fall back to `profile`), `Album` (`?id=` and `?n=` photo position, `PhotoCanvas` at 480×360, prev/next, caption, comments out by today). Albums, blog posts, guestbook entries and photo comments are day-gated. Names use `profileName` (like Friendspace pages), not the Messenger display names. Text lives in `content/sites/pixlog.ts` (+ German twin); Searchly indexes `/`, `/album` and every friend page from the site meta. `/me` arrives with P2-03 (until then it shows "Page not found").
