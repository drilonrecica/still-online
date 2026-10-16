# still online v0.4: Friendspace, Pixlog and GlitterCodez

Design spec. Status: agreed in brainstorming on 2026-10-15, waiting for the owner's review.

## Why

The first roadmap promised "Netlog / MySpace-style profile pages". v0.2 delivered Spaceport, a profile site you can read but hardly use. You can edit your own page (headline, mood, song, six themes, Top 8 order) and read friends' day-gated walls. Nothing else in the game notices it, and there is no Netlog at all.

v0.4 brings back the two networks a 2007 teenager had open in the same browser: one for showing off (MySpace) and one for photos and gossip (Netlog). The focus is **self-expression, story content and nostalgia details**. It is not a social engine: the only things you write are your own page, kudos and your Top 8.

## Decisions

| Topic          | Decision                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Structure      | Two sites. The MySpace homage and a new Netlog homage feel different, as they did in 2007.                                   |
| MySpace homage | Spaceport is renamed **Friendspace** (`friendspace.example`).                                                                |
| Netlog homage  | **Pixlog** (`pixlog.example`).                                                                                               |
| Layouts        | A new layout site, **GlitterCodez** (`glittercodez.example`), with copyable codes in a safe made-up markup.                  |
| Story          | Days 1–5 only, tied into the existing arcs. No new days.                                                                     |
| Languages      | English and German. German is written for a German 2007 (as in v0.3), with parity tests.                                     |
| Names          | Original only, `.example` hosts only. "NetZLog" and "YourSpace" were considered and dropped as too close to the real brands. |
| Build          | Directly, step by step, one commit per step with all checks green. No push or tag without the owner.                         |

## Friendspace (was Spaceport)

**Rename.**

- Every visible "Spaceport" becomes "Friendspace", in both languages: friends' chat lines, mail, files, Searchly and default favorites.
- The logo becomes two overlapping chat-bubble planets.
- Internal ids, such as the mail ids `d2-spaceport-views`, stay as they are, so saves keep working.
- Old `spaceport.example` URLs redirect to the same path on `friendspace.example`, whether typed, saved as a favorite, or open in a restored window.

**Bulletins.**

- A `/bulletins` page, plus the newest three on your page.
- Two to four a day from friends and Top 8 extras: chain letters ("repost in 5 min or…"), surveys, "NEW PICS on pixlog!!" (links to Pixlog), and Tinfoil Comets promos that follow the concert arc.
- An unread dot in the nav until you open the page that day.

**Band pages.**

- `/band/<id>` for each artist on the playlist, under an original band name.
- Each has a bio, shows, band-blog lines and a dark MySpace-style inline player (play/pause, track list, progress).
- The player drives Amplifier, so mute and volume stay in one place.
- Bands can sit in a Top 8.

**Profile songs autoplay.**

- Opening a friend's or band's page plays its song once, but only when the game isn't muted and Amplifier isn't already playing.
- The song strip has a stop button, and your page has an "autoplay profile songs" checkbox (on by default).

**Top 8 drama.**

- Your Top 8 becomes fully editable: friends, bands and extras, with add, remove and reorder.
- Drop a friend and they notice: on the next day they sign in, they open a short Messenger conversation, and a hurt comment appears on your wall.
- Put them back and they say something happy, once.
- This uses a new Messenger trigger, `onTop8Dropped`, with one reaction pair per friend in the content.

**Profile extras**, switched on by layout codes:

- a glittering headline
- stickers
- a sparkle cursor inside the profile (off with reduced motion)
- "Thanks for the add!!" style comment graphics on walls
- a mood history showing your last five moods

## GlitterCodez

A free-layouts site as it looked in 2007:

- a gallery of about twelve layouts (Emo Black/Pink, Pony Pastel, Starry Night, Leopard, Rainbow Glitter, Skater Grunge, Gamer Green…), each with a live mini preview and a "copy this code!!" box
- pages for glitter text, stickers and cursors
- fake huge counters and a "link back 2 us plz" note

**Codes** look like real 2007 codes but are a small made-up markup:

```
<!-- GlitterCodez.example layout #07 -->
[layout bg=starry text=#fff accent=#f0c font=comic glitter=on]
[cursor sparkle] [sticker star top-right] [sticker heart bottom-left]
<!-- end code -->
```

**Pasting and parsing:**

- You paste a code into the new "Layout code" box in Friendspace's editor, and your page changes in the live preview.
- The parser never fails. Unknown tags and keys are ignored, colours must be `#rgb` or `#rrggbb`, and backgrounds, fonts, stickers and cursors come from fixed, original sets.
- A bad paste changes less; it never breaks the page and never runs as CSS or HTML.
- The gallery's codes are generated from the same definitions the parser reads, so every published code works.
- The six existing themes stay as quick presets.

## Pixlog

A bright white-and-orange site with rounded tabs and big thumbnails, clearly not Friendspace.

**Pages:**

- `/`: a login splash and the **shouts feed**.
- `/<friend>`: tabs for profile, photos, blog, surveys and guestbook.
- `/album?id=`: one album.
- `/me`: your page.

**Friends' content** (one file per friend):

- one or two photo albums (party, holiday, school trip) of procedural "digicam" photos, with captions and day-gated comments that carry small side stories
- two to four blog posts
- a filled-in survey ("25 things about me", "this or that")
- daily shouts
- guestbook entries
- the days they give you kudos

**Derived, so nothing drifts:**

- The shouts feed combines friends' shouts with generated lines ("Dex added 4 photos to _Summer 07_", "Kayla wrote a new blog post"), newest first.
- Your visitor list is the friends who are active that day plus a few seeded strangers.
- The visitor counter grows each day.

**Your page:**

- visitors, kudos received, and a choice of six colour skins
- an album filled from My Pictures (generated photos, Snapshot Booth and Paint images) with your own captions
- surveys you fill in and post

**Kudos.** You can give each friend one kudo a day; their page shows the total.

**Mail.** "You have 3 new visitors on Pixlog!" on day 2, and a Friendspace bulletin notice on day 4.

## Saved state

Everything lives in the existing `web` store. Every new field is optional and sanitized on its own, so v0.3 saves load unchanged:

- **Your Friendspace profile gains:**
  - the pasted layout code (parsed when shown)
  - the autoplay setting
  - a mood history (at most five)
  - a Top 8 of typed entries (`contact`, `band`, `extra`); old saves' friend-id lists migrate
- `top8Dropped`: who was dropped, and on which day.
- `bulletinsSeen`: the last day you opened the bulletins.
- **`pixlog`:**
  - skin
  - album entries (a My Pictures file id plus caption; deleted files drop out)
  - survey answers
  - the days you gave each friend kudos

## Content and languages

- **Where it lives:**
  - English: `src/content/friendspace/` (bulletins, bands, Top 8 reactions; the profiles move here), `src/content/pixlog/` (one file per friend plus shared survey questions) and `src/content/sites/glittercodez.ts`.
  - German: full modules in `src/content/de/…`, loaded with the rest of German in the lazy chunk.
  - Parity tests require the same ids, counts and days in both languages.
- **German glossary:** wall → „Pinnwand", kudos → „Kudos", visitors → „Besucher", bulletins → „Bulletins", Top 8, shouts → „Shouts", layout codes → „Layout-Codes". Friends keep their voices from `docs/localization-de.md`.
- **Rough volume, each in English and German:**
  - per friend: 1–2 albums of 4–6 photos, 2–4 blog posts, 1 survey, 5 days of shouts and a guestbook (× 6 friends)
  - about 15 bulletins
  - 4 bands
  - 12 layouts
  - 6 Top 8 reaction pairs

## Testing

- **Unit:**
  - every gallery code round-trips through the parser; junk and half codes are tolerated
  - the derived feed and visitors are deterministic per day
  - sanitize for each new field, plus the Top 8 migration
  - kudos once per friend per day
  - Top 8 drop fires the reaction once, re-add fires once
  - the Spaceport redirect
  - parity and lint over the new content
- **Browser (English and German):**
  - copy a GlitterCodez code, paste it into Friendspace, and the page changes
  - give a Pixlog kudo
  - add a Snapshot Booth picture to your album
  - drop Kayla from your Top 8, and the next day she reacts in Messenger and on your wall
  - the bulletins dot
  - the band player plays through Amplifier and respects mute
  - an old Spaceport favorite opens Friendspace
- **Review:** screenshots of every new page in both languages, looked at full size. Build sizes are checked: German stays in its lazy chunk, and the growth of English start-up JS is reported.

## Build order

1. This spec.
2. Rename to Friendspace, with redirects and the new logo.
3. State model and migrations.
4. Bulletins, band pages and autoplay.
5. GlitterCodez, the layout-code parser and profile extras.
6. Top 8 editing and drama.
7. Pixlog shell.
8. Pixlog features.
9. English content.
10. German content.
11. Browser tests, screenshot review, docs and v0.4.0 release notes.

## Addendum: player gender (2026-10-16)

The player now picks Girl or Boy on the login screen. That design is in `2026-10-16-player-gender-design.md` and ships as phase G, before the rest of v0.4. For this spec, it means:

- Text addressed to or about the player uses `g(girl, boy)`.
- The Friendspace profile and Pixlog skin defaults follow the gender.
- GlitterCodez has 6 girly and 6 boyish layouts and features the player's side first; its stickers and cursors include boy items.
- One browser flow and part of the release playthrough run as a boy.
