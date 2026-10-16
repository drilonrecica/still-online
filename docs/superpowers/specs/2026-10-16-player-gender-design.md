# still online: the player is a girl or a boy

Design spec. Status: agreed with the owner on 2026-10-16. It ships as igris phase **G**, before the v0.4 Friendspace/Pixlog work.

## Why

The game felt "too girly". The cast is balanced: three girls (Jess, Kayla, Pia) and three boys (Marco, Theo, Dex) with about the same number of lines. But everything that belongs to *the player* is girl-coded:

- **Files:** the concert packing list with hair clips, a crush letter and a crush poem about Theo, a horse diary.
- **Web:** the gossip blog and the band fan site are the only "fun" sites, and both are girly.
- **Mail:** a love chain letter, and Mom asking about "a boy named Dex".
- **Chats:** outfit and sleepover talk aimed at the player.

There is no boy-oriented site at all. Meanwhile, German has to work around the player's gender everywhere.

## Decisions

| Topic | Decision |
|---|---|
| Choice | The player picks **Girl** or **Boy** on the login screen. There is no third option. |
| Principle | Anything girly stays girly, or gets girlier, for a girl. A boy gets the boy version of 2007 instead. |
| What stays | The six friends, their personalities and voices, the 5-day story and the games. |
| Crush | A girl keeps the crush on Theo. A boy has **no crush**; his versions of those files are other embarrassing things. |
| Chats | Lines about the player change, and girl-talk aimed at the player becomes boy-talk for a boy. The friends' personalities and the story don't change. |
| New sites | **CheatCave** (`cheatcave.example`) and **Kickflip Kings** (`kickflipkings.example`). |
| Changing it | A **User Accounts** app (Control Panel) changes the name, gender and user picture. |
| Order | Phase G runs before v0.4 P0-02, so Friendspace, Pixlog and GlitterCodez are written gender-aware from the start. |

## Choosing

- **Login:** under the name, a radio group "I am a: ○ Girl ○ Boy" (German „Ich bin: ○ Mädchen ○ Junge"), styled like the language flags. Log On stays disabled until both the name and the gender are set.
- **Old saves** have no gender, so those players are asked once, like the name migration in v0.3.1.
- **User pictures:** eight original XP-style user tiles. Girl-leaning: butterfly, flower, kitten, heart guitar. Boy-leaning: skateboard, game controller, football, rocket. The default follows the gender, and the picture shows on the login tile and in the Start menu.
- **User Accounts app:** changes the name, gender and picture. It is also the first way to change the name after the first login.

## How content varies

**Authoring:**
- Content stays plain strings. A helper `g(girl, boy)` writes both versions into one string, so it also works mid-sentence:

  ```ts
  `ur my fave ${g('cousine', 'cousin')}`
  ```

  (In English it's mostly whole lines or files; in German it's often single words.)
- Non-text values, such as a photo's scene, use `gendered({ girl, boy })`.
- **Resolving:** `contentFor(locale, gender)` resolves every variant once per language and gender. The rest of the game only ever sees plain text.
- **Saves:** they store ids and references, never rendered text. Switching gender re-renders chats, mail and untouched files in place, the same way a language switch does. Files the player edited keep their text.

**Rules:**
- Both genders share the same ids, line and choice counts, days and story facts.
- German may vary where English doesn't, using natural gendered words: „Heldin/Held", „Lieblingscousine/Lieblingscousin", „die/der Beste", „Partnerin/Partner".
- **Tests:** lint, parity and the full chat playthrough run for both genders in both languages.

## What changes per gender

**My Documents, Recycle Bin, My Pictures.** The same file slots, with two versions each.
- **Girl:** today's set, a bit girlier: the crush letter and poem about Theo, the horse diary, the concert packing list with hair clips.
- **Boy:** his own set, for example:
  - `cheat_codes.txt`
  - `skate_tricks_list.txt`
  - `my_band_names.txt`
  - `wrestling_moves_DONT_TRY.txt`
  - the rap lyrics
- **Pictures:** the webcam self-portrait has short hair for a boy and long hair for a girl, and the captions change.

**Player defaults:**
- the Friendspace profile (glitter preset vs midnight, headline, mood)
- the Snapshot Booth cartoon look
- the Messenger picture colours

**Chats:**
- **Lines about the player:** compliments, "my hero" and cousin talk.
- **Topic swaps for a boy:**
  - outfit talk becomes hoodie and hair-gel jokes
  - Kayla's "our own sleepover" becomes "movie night at mine"
  - Theo's flirty answer becomes buddy banter

**Mail:**
- Kayla's love chain letter becomes a "send this to 10 ppl or ur console breaks" chain.
- Mom's mail about Dex loses the romance angle.
- The fan newsletter and the ringtone spam get boy versions (a CheatCave newsletter, "FREE cheat codes" spam). The concert facts the story needs are kept.

**Web:**
- **Default favorites:**
  - Girl: Celeb Gossip 07 and Tinfoil Comets.
  - Boy: CheatCave and Kickflip Kings.
  - Both: Friendspace and Westfield High.
- Favorites the player never changed follow the gender.
- Searchly's home page has a per-gender "hot sites" box.
- Every site exists for both genders and can be found through Searchly.

**New sites** (English and German, days 1–5, a 2007 look):
- **CheatCave** (`cheatcave.example`):
  - cheats for invented games, including the game's own Mines, Hen Hunt and Star Pinball
  - flash-game news
  - "top 10 funny clips"
  - a forum where Theo asks a shy question and Dex and Marco turn up
  - fake visitor counters
- **Kickflip Kings** (`kickflipkings.example`):
  - a skate crew site with trick tips, crew pages and a shoutbox
  - Velvet Lantern gig listings
  - Dex's skate video premieres there on day 5, and his chat links to it for both genders

## Effects on v0.4

- Anything on the new sites that is addressed to or about the player uses `g()`.
- **Defaults:** the Friendspace profile and the Pixlog skin follow the gender.
- **GlitterCodez:**
  - The gallery becomes 6 girly layouts (Emo Black/Pink, Pony Pastel, Leopard Luxe, Rainbow Glitter, Hearts 4 Ever, Starry Night) and 6 boyish ones (Skater Grunge, Gamer Green, Checkerboard Punk, Flames, Camo, Midnight Purple).
  - The player's side is featured first.
  - Stickers and cursors include skulls, flames, skateboards and controllers.
- **Release testing:** one browser flow runs as a boy, and the release playthrough plays as a girl on days 1–3 and as a boy on days 4–5.

## Testing

- **Unit:**
  - settings sanitize and migration
  - login gating
  - User Accounts
  - `g()` encoding and resolving
  - lint of malformed variants
  - parity, lint and playthrough for girl and boy in English and German
  - re-rendering on a gender switch (files, chats, mail)
  - per-gender favorites
- **Browser:**
  - pick Boy at login → My Documents shows the boy files and the favorites show CheatCave
  - switch to Girl in User Accounts → untouched files and favorites swap
  - both new sites open and are found by Searchly
- **Review:** screenshots of every changed surface for girl and boy, in English and German, looked at full size.
