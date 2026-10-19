# Player gender

The player is a girl or a boy (v0.4 phase G, design: `docs/superpowers/specs/2026-10-16-player-gender-design.md`). Content varies only where it is addressed to or about the player; the six friends, their voices and the story stay the same.

## Settings

- `settings.gender: 'girl' | 'boy' | null` and `settings.userPicture` (`src/os/store/settings.ts`). `null` means not chosen yet (only before the first logon) and resolves as `'girl'`.
- Read them only through `getGender()` / `useGender()` (and `getUserPicture()` / `useUserPicture()`) in `src/i18n/settingsText.ts`. The login screen and the User Accounts app set them.

## Authoring: `g()` and `gendered()`

`src/content/gender.ts`:

- **`g(girl, boy)`** writes both versions into **one string** between private-use markers (U+E000 girl U+E001 boy U+E002). Content types stay `string`, so it works anywhere, mid-sentence too:

  ```ts
  `siehste. deswegen bist du ${g('meine lieblingscousine', 'mein lieblingscousin')}`;
  ```

- **`gendered({ girl, boy })`** is for non-string values (a `PhotoSpec`, a list). It is typed as the value itself and is a branded `{ __gendered: true, girl, boy }` until resolved.
- **Rules** (the content lint enforces the first two):
  - No nesting, and both sides non-empty.
  - Both sides share ids, line and choice counts, days, links and story facts. Only text differs.
  - Use a variant for compliments, nouns for the player, crush talk and topics aimed at the player. A girl gets girly 2007, a boy gets boyish 2007, and a boy has no crush anywhere.
  - German may vary where English doesn't, with natural forms („Heldin/Held", „die/der Beste"). Never gender-star forms.
  - **Never branch on gender in components** for content text; put the variant in the content. UI catalog strings that need it take a `gender` param.

## Resolving

- `resolveGender(value, gender)` deep-walks plain objects and arrays, replaces each marker pair with the chosen side, and replaces `gendered` values with their side. Unchanged parts keep their identity and inputs are never mutated. Functions in content are not resolved.
- **The one resolving point** is `contentFor(locale, gender)` in `src/content/locale.ts`, memoized per raw content object and gender (`resolvedFor`). Every accessor (`getContacts`, `getSeedFiles`, `getMailContent`, `getSiteText(host, locale, gender)`, …) takes the gender and returns plain text.
- Contact overlays merge **before** resolving, so `mergeOverlay` sees raw strings. `rawContentFor(locale)` is the unresolved content for parity and lint.
- Messenger's engine plays the raw English structure and resolves live lines and choices for the current gender (`getGender` engine option); `renderEntry` also resolves, so it is safe on raw content.

## Re-render on a gender switch

Saves store ids and references, never rendered text, so a gender switch re-renders like a language switch:

- **Messenger:** `renderEntry`/`renderTranscript`/`renderPersonalMessage` take the gender and cache per gender; views read `useGender()`.
- **Files:** the fs store tracks `locale:gender` and re-renders untouched seeds (`localizeNodes`): name, text, caption and the self-portrait's `photo.look`. Each personal seed slot (My Documents, Recycle Bin) has a girl and a boy file under the same id; school files, Marco's notebook and Pia's fanfic are shared. Seeds the player renamed or edited (`dirty`) keep their text.
- **Mail:** `renderMail`/`renderMails` take the gender. Attachments saved to disk are frozen copies and don't change.
- **Sites:** `useSiteText(host)` reads `useGender()`; `meta(locale)` reads `getGender()`, and Searchly rebuilds its index on a switch.

## Audit

`src/content/genderAudit.test.ts` (G2) resolves all content as a boy (`contentFor(locale, 'boy')`, EN and DE) and scans every readable string for girly cue words (`<3`, `(L)`, `glitter`, `sleepover`, `cute`, „hdgdl", „Glitzer", „Übernachtungsparty" …; the list is in `src/content/genderAudit.ts`). Ids, styling, links and author screen names are skipped.

- Paths are stable: `en/contacts/jess/day3/sparkly/lines[1]`, `…/choices[0]/text|label`, `de/pixlog/kayla/albums/kayla-sleepover/title`.
- Every hit must be on the allowlist (`src/content/genderAudit.allow.ts`) as `{ where, match, reason }`. Reasons: `friend-self-talk` (her own glitter, outfit or PM), `story-fact` (Jess's glitter sign, Brianna's sleepover as Kayla's story, Pia's ponies), `site-content` (a site's text or what others wrote on a friend's page; only these may use a `/*` prefix with `match: '*'`), and `pending` (seeded before G2; G2-02 removes them).
- What the boy types (choice `text` and `label`) is never allowed with a real reason. Stale entries fail the test, so the list only shrinks.
- `npm run gender-audit` runs the test and prints, per module, the hits and how many strings differ by gender.

**Patterns for a boy** (G2): the friend keeps her voice and her girly things; what changes is what she says to him and pulls him into. He teases the glitter, gets (Y) or „dude" instead of (L) or <3, is the outsider or reluctant helper in girls' plans (never at the sleepover), and answers with short guy-talk.

## Tests

- `src/test/setup.ts` pins `gender: 'girl'`. A test of the boy side sets `useSettingsStore.setState({ gender: 'boy' })` (or passes `'boy'` to an accessor) itself.
- Lint (`content.test.ts`), parity (`parity.test.ts`, raw modules plus girl-vs-boy structure) and the chat playthrough (`playthrough.test.ts`) run girl/boy × en/de. `genderSwitch.test.tsx` switches a chat, a file and a mail live.
- Every task that adds player-facing content adds at least one boy assertion.
