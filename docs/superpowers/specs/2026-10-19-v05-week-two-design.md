# still online v0.5: week two (days 6–10)

Design spec. Status: written 2026-10-19 at the owner's request ("plan both as igris phases"). The owner reviews it before the run. It ships as igris phases **W0–W4**, after the v0.4.1 fixes (phase **F**).

## Why

Only days 1–5 are scripted. From day 6 on, the friends keep their day-5 state, the sites stop posting, and the balloon only says "Your friends are up to something." A player who comes back after the first week finds a frozen world.

v0.5 adds a **second school week**, days 6–10:
- every friend and storyline continues
- everything builds to one shared finale on day 10, **the Velvet Lantern show at the rec hall**, which Marco announced on day 1 and which never happened on screen

From day 11 on, the day-10 state stays, as day 5's did before.

## Decisions

| Topic | Decision |
|---|---|
| Length | Days 6–10, the same density as days 1–5. Each friend gets one `onDay` script a day, with 4–6 nodes, 2–3 choices and a new personal message. There are 4–6 mails a day, and every site keeps posting. |
| Finale | Day 10 is the Velvet Lantern rec hall show. All six friends are involved and the player is "on the list" (Marco's day-5 promise). |
| Calendar | It's the second school week in the fall term, 2007. Days still have no weekday names ("today", "tmrw", "saturday" only where day 1 already said it for the rec hall show). |
| Gender | Everything is written gender-aware from the start, using `g()` for anything about or addressed to the player. A boy is a guy friend (G2 rules), and a girl keeps the Theo crush, which gets a sweet, small step. There are 3 new `forGender: 'boy'` and 3 new `forGender: 'girl'` threads. The gender audit stays green. |
| Language | English first. German comes as structural placeholders, then real German in W3, the same pattern as v0.4 P3/P4. |
| New art | Three new procedural photo scenes: `stage` (the rec hall show), `classroom` and `livingroom` (these two were missing in v0.4). The day-10 album photos use them. |
| Unlock | On day 10 Theo gives the player his show poster as a desktop wallpaper (`unlock: 'lantern-poster'`), a new procedural wallpaper like Pony Paradise. |
| Out of scope | Any new app, new site or new game; player-written posts; days past 10. |

## The arcs (day 6 → day 10)

**Marco — Velvet Lantern plays the rec hall:**
- **Day 6:** the bean cellar gig is over, and the rec hall show is "for real now, saturday". He needs a poster and asks the player whether Theo still draws.
- **Day 7:** the setlist argument. Derek wants the bucket kick in every song.
- **Day 8:** "we're playing ur song. dont make it weird." He means "lantern heart" from the player's `song_lyrics_notebook.txt`. A boy gets his own lyrics from G2-04's notebook.
- **Day 9:** the sound check disaster. The rec hall's mic only works upside down.
- **Day 10:** show day, dry as ever: "11 ppl last time. this time the room fits 80. so like 12".

**Theo — the poster:**
- **Day 6:** after the B+, Mr Dalton put his cell drawings on the classroom wall. He is embarrassed and proud.
- **Day 7:** Marco asks, through the player, for a poster, and Theo says yes after three apologies.
- **Days 8–9:** drafts. He asks the player to choose between two designs (a choice that is remembered only as flavour, with the same story either way).
- **Day 10:** the poster is all over school and the rec hall. He gives the player the wallpaper (`lantern-poster`).
- **For a girl:** on day 9 he asks whether she'll be at the show, "maybe we could stand near the back. i mean. together. if u want. sorry". On day 10 they stand together. That's all, PG.
- **For a boy:** buddy banter, and Theo asks him to stand with him because he doesn't know anyone.

**Jess — after the concert:**
- **Day 6:** a bruise from the drumstick, which now hangs over her bed. "ZIGGY TOUCHED THIS".
- **Day 7:** the Tinfoil Comets fan site announces a fan art contest. Jess enters with a glitter collage. A boy teases her and suggests flames.
- **Day 8:** the Lakeview Fairgrounds show (from the tour page) is sold out. She is devastated in ALL CAPS.
- **Day 9:** she places second in the contest and wins a signed setlist. The fan site posts the winners.
- **Day 10:** she comes to the rec hall show with a new sign, "MARCO THROW A PICK". Marco refuses to throw a pick, then throws one.

**Kayla — class rep election vs Brianna:**
- **Day 6:** a new haircut (bangs). "if brianna copies it its ON".
- **Day 7:** Brianna has bangs too, and both run for class rep. Posters go up on the Westfield High site.
- **Day 8:** speech drafts. Kayla asks the player to rate her slogan. A boy gives a guy's honest answer, and a girl helps with glitter.
- **Day 9:** vote day. It's a tie.
- **Day 10:** they become co-reps and go to the show together, wearing matching outfits by accident. "~*plot twist*~".

**Pia — Operation Hamster:**
- **Day 6:** she wants a hamster and writes "WHY I NEED A HAMSTER" on the family computer.
- **Day 7:** she presents it to Mom with a Paint drawing.
- **Day 8:** Mom says "we'll see", which Pia knows means no. She asks the player to talk to Mom.
- **Day 9:** a compromise: a goldfish.
- **Day 10:** the goldfish is called "Sir Stardust the Second" and lives on her desk next to the ponies. She is too young for the show and is furious about it; Mom says "next year".

**Dex — the Westfield Jam:**
- **Day 6:** his 30-second video has 41 views on Kickflip Kings. "like 30 of them r me".
- **Day 7:** Kev's crew invites him to the Westfield Jam, a skatepark contest on day 9.
- **Day 8:** he practices and stays Away all day.
- **Day 9:** he lands the kickflip in front of everyone, finishes third, and gets a sticker pack. The camera is ON this time, and Kev films it.
- **Day 10:** he films the Velvet Lantern show on the new tape, and Mom meets him at drop-off.

**Mom and school mails:**
- **Mom:**
  - **Day 6:** "how was your week".
  - **Day 8:** a parent-teacher note.
  - **Day 10:** she drives the player to the show and meets Dex: "He was very polite. He called me ma'am. Twice." A girl also gets "So THAT is Dex", while a boy gets "please wear a helmet" humour. No crush for a boy, and no romance on Dex for either.
- **Mr Dalton:** a leaf collection project (day 7) and a field trip permission slip (day 8).

**Shared:**
- **Sites keep posting:**
  - Celeb Gossip 07: 2 posts a day.
  - Westfield High: the election and the show listing.
  - Tinfoil Comets: the contest, the winners and the sold-out show.
  - CheatCave: news and forum days 6–10.
  - Kickflip Kings: the Westfield Jam and the view counter.
- **Friendspace:** bulletins, walls and `commentsOnPlayer` every day, plus Velvet Lantern's band page show listing and blog.
- **Pixlog:** each friend gets one new album in week two. The day-10 show album uses the `stage` scene.
- **Gender-only threads:**
  - **boy:**
    - Dex invites him to skate the Jam course on day 8.
    - Marco's LAN rematch is on day 7.
    - Marco makes him crew for the rec hall load-in on day 10.
  - **girl:**
    - Kayla's "help me pick an outfit for the show" is on day 9.
    - Jess's glitter-sign workshop is on day 9.
    - Jess and the player do a sleepover-style phone call ("are u awake") on day 8.

## Testing

- **Lint:** the story-day range is 1–10.
- **Unit:**
  - Per-day tests loop over 1–10.
  - The playthrough runs days 1–10 for girl and boy, in English and German.
  - The audit stays green.
  - Parity and fallback stay green.
- **e2e:**
  - Reach day 10, open the rec hall show album, get the poster wallpaper, and check that Westfield High shows the election result.
  - Repeat the same as a boy, which also checks a boy-only thread.
- **Review:** play days 6–10 in English as a girl and as a boy, and German days 8 and 10.
