# German localization style guide (v0.3, v0.4 glossary)

The rulebook for every German content task (P2-02 … P2-07) and the German content rubric (P2-G, P3-G). Read it whole before writing a single German line. UI strings follow the "German defaults" table in `tasks.md` and `docs/i18n.md`; this guide is about **authored content**: chats, presence messages, mail, files, profiles, sites, tips.

## 1. The goal

A German 15-year-old in 2007 should feel at home. They sit at the family PC after school, the modem blocks the phone line, Mama shouts up the stairs, and tomorrow there's a Bio-Referat in the first period.

- **Localize references, don't translate words.** Ask "what would a German kid in 2007 say here?", not "what does this English word mean?". Swap American things for German ones (Thanksgiving, B+, homeroom, jello, brownies, dollars).
- **Keep every storyline beat, every branch's meaning and every unlock.** A branch where the player is mean stays mean. A callback ("pics or it didnt happen", COMTES, the toaster sign) must still land later, so check the glossary (§5) before you invent a phrase.
- **Change how it's said, not what happens.** Same events, same jokes (or a German joke with the same shape), same pacing.
- **Same people, same names.** Friend names, handles, band names, hosts and the product name never change.

## 2. The six German voices

Shared basics for all friends: they write mostly **lowercase** (nouns too), use **„du"** with the player, and type the way people talk („hab", „is", „nich", „ma", „nen", „grad", „haste"). Emoticon codes stay exactly the same (`:) :( :D ;) :P :O (Y) (N) <3 (L)`).

**The player is a girl or a boy** (chosen at login, since v0.4 phase G). German marks gender where English doesn't, so use natural gendered forms through `g(girl, boy)` (`src/content/gender.ts`, see `docs/gender.md`): `` `deswegen bist du ${g('meine lieblingscousine', 'mein lieblingscousin')}` ``, `` `du bist ${g('die', 'der')} BESTE` ``, `g('Heldin', 'Held')`, `g('Konzertpartnerin', 'Konzertpartner')`. German may use a variant where the English line has none. **Never gender-star forms** („Held*in", „Partner:in"); they're not 2007. **Friends' own words don't change:** only what is said to or about the player varies; how Jess, Kayla, Dex, Theo, Marco and Pia talk about themselves stays the same for both. „Zwerg" stays Marco's nickname for the player either way: it's grammatically masculine but used for any kid.

### Jess: loud, ALL CAPS, nudges

The concert is her whole life. She shouts in CAPS, stacks „!!!" (with the occasional „!!!1"), nudges constantly, says „OMG", „boah", „krass", „mega", and signs off emotional moments with „hdgdl" / „HDGDL". She tells terrible jokes and is proud of it.

| English                                            | German                                               |
| -------------------------------------------------- | ---------------------------------------------------- |
| `i WON the radio contest!!!`                       | `ich hab das RADIO-GEWINNSPIEL gewonnen!!!`          |
| `2 TICKETS to the Tinfoil Comets!!! :D`            | `2 KARTEN für die Tinfoil Comets!!! :D`              |
| `best night of our lives (L)`                      | `beste nacht UNSERES LEBENS (L) hdgdl`               |
| `homework is for the WEAK :P`                      | `hausaufgaben sind was für SCHWÄCHLINGE :P`          |
| `why did the cd player cry? it had too many skips` | `warum musste die cd zum arzt? sie hatte nen SPRUNG` |
| `I CANT FIND THE TICKETS`                          | `ICH FIND DIE KARTEN NICH`                           |

### Kayla: ~_drama_~

Everything is a tragedy, especially Brianna. She sighs in asterisks (`*seufz*`), says „ich kann nicht mehr" about small things, calls things „voll fies" and „unmöglich", and her personal message („Spruch") changes all the time, decorated `~*…*~`. Drama vocabulary: „Drama-Queen" is fine (German teens used it).

| English                                                | German                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `did u see what brianna put as her away message`       | `hast du gesehen was brianna für nen spruch drin hat`                           |
| `{name}. it is ALWAYS about me`                        | `{name}. es geht IMMER um mich`                                                 |
| `i am a drama PRINCESS. theres a difference`           | `ich bin ne drama-PRINZESSIN. das is ein unterschied *seufz*`                   |
| `theyre doing face masks and scary movies. i HATE fun` | `die machen gesichtsmasken und horrorfilme. ich HASSE spaß. ich kann nich mehr` |
| `~*the rain knows my secrets*~ :(` (pm)                | `~*der regen kennt meine geheimnisse*~ :(`                                      |

### Dex: slow, short, always Abwesend

The skater. Long pauses, short lines, no capitals, no effort. „jo", „kp" (kein Plan), „ka", „egal", „fett" (for "sick"), „bin ma kurz weg", „später". He's always Abwesend and thinks that's a lifestyle. Skater words that stay English because German skaters used them: „Kickflip", „Board", „Grip Tape", „Skatepark"; a landed trick is „gestanden" („hab ihn gestanden").

| English                                         | German                                            |
| ----------------------------------------------- | ------------------------------------------------- |
| `oh hey {name}`                                 | `oh. jo {name}`                                   |
| `its a lifestyle`                               | `is so ne lebenseinstellung`                      |
| `landed a kickflip. finally`                    | `hab nen kickflip gestanden. endlich`             |
| `nvm. dinner. brb (prob not)`                   | `egal. essen. bin ma kurz weg (eher nich)`        |
| `gotta find the charger first. could take days` | `muss erst ma das ladekabel finden. kp wo das is` |

### Theo: shy, apologizing, …

The bio partner. He apologizes for existing („sorry", „tschuldige", „tschuldigung"), starts with „ähm"/„öhm", trails off with „…", and explains too much and then takes it back. Correct spelling, lowercase, rarely an emoticon (and he apologizes for that too).

| English                                                       | German                                                                     |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `um hi`                                                       | `ähm hi`                                                                   |
| `is this {name}? from bio?`                                   | `bist du {name}? aus bio?`                                                 |
| `i can draw the chloroplasts. theyre like little green beans` | `ich kann die chloroplasten malen. die sehen aus wie kleine grüne bohnen…` |
| `the mitochondria is the powerhouse of the cell`              | `die mitochondrien sind die kraftwerke der zelle`                          |
| `sorry. that was a weird thing to say`                        | `tschuldige. das war komisch. vergiss es`                                  |
| `B+ :) (sorry for bragging)` (pm)                             | `ne 2+ :) (sorry fürs angeben)`                                            |

### Marco: dry, lowercase, never „!"

The older cousin at Uni with the band. **All lowercase, never an exclamation mark**, short deadpan sentences, mostly correct spelling (he's a student, not a kid). Calls the player „zwerg". Understatement over excitement. „klassiker." is his "classic."

| English                                          | German                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `hey kid`                                        | `hey zwerg`                                                                        |
| `and dont fill it with toolbars lol`             | `und müll ihn nicht mit toolbars zu. lol`                                          |
| `velvet lantern @ the rec hall, saturday`        | `velvet lantern im jugendzentrum, samstag`                                         |
| `ok flames maybe. small flames. tasteful flames` | `ok vielleicht flammen. kleine flammen. geschmackvolle flammen`                    |
| `see. this is why ur my favorite cousin`         | `siehste. deswegen bist du ${g('meine lieblingscousine', 'mein lieblingscousin')}` |
| `away. classic.` (away reply)                    | `abwesend. klassiker.`                                                             |

### Pia: the bossy little sister

Almost 10, on Papa's laptop for 20 minutes. Bossy, dramatic, ponies („Ponys", never "Ponies"), threatens to tell on you: „ich sags Mama!!", „MAMAAAA". CAPS for orders. Calls her parents **Mama** and **Papa**. She's a detective when ponies go missing.

| English                                    | German                                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| `im on dads laptop!! he said i get 20 min` | `ich bin an papas laptop!! er hat gesagt ich darf 20 min` |
| `i told mom already :P`                    | `ich habs mama schon gesagt :P`                           |
| `FINE. im telling mom u said no`           | `GUT. ich sags mama dass du nein gesagt hast!!`           |
| `ponies DONT RUN AWAY {name}`              | `ponys LAUFEN NICH WEG {name}`                            |
| `she is the queen she goes in the MIDDLE`  | `sie is die königin sie kommt in die MITTE`               |
| `DO NOT GO IN MY ROOM` (pm)                | `NICHT IN MEIN ZIMMER GEHEN!!!`                           |

### Grown-ups and senders outside the friend list

| Sender                                       | Voice                                                                                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mama                                         | „Hallo Schatz,", proper capitals, too many „!!", explains the computer wrong, signs „Hab dich lieb, Mama". P.S. questions about the computer („Wie mache ich die Schrift größer"). |
| Herr Dalton                                  | Correct, dry teacher humor. Writes to the class with „ihr" („Liebe Klasse 9b, …"), never „Sie" to students. Signs „Herr Dalton, Biologie, Raum 12".                                |
| PixelPoint, spam, VirusGuard, school website | Formal „Sie", like German companies and offices in 2007.                                                                                                                           |
| Friendspace, Celeb Gossip 07, fan pages      | „du"/„ihr", exclamation-heavy.                                                                                                                                                     |
| Tacki (assistant)                            | „Sie", like the original assistants („Es sieht so aus, als würden Sie einen Brief schreiben…").                                                                                    |
| Flocke (sheep)                               | „du".                                                                                                                                                                              |

## 3. 2007 German chat-speak

| Term                | Meaning                                                | Who uses it                                     |
| ------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| lol                 | laughing                                               | everyone (Marco: dry „lol.")                    |
| rofl                | very much laughing                                     | Jess                                            |
| omg / OMG           | oh mein Gott                                           | Jess (CAPS), Kayla                              |
| hdl                 | hab dich lieb                                          | Jess, Kayla                                     |
| hdgdl               | hab dich ganz doll lieb                                | Jess (her signature), Kayla when making up      |
| hdmfg               | hab dich mega fett gern                                | rare: Jess at peak emotion only                 |
| kp                  | kein Plan                                              | Dex, Pia                                        |
| ka                  | keine Ahnung                                           | Dex, Kayla                                      |
| bb                  | bye bye                                                | Jess, Pia                                       |
| bg                  | bin gleich (wieder da)                                 | Jess, Kayla                                     |
| brb                 | be right back (also used in German)                    | Jess, Dex                                       |
| \*knuddel\*         | hug                                                    | Jess, Kayla                                     |
| \*g\*               | grin                                                   | Marco (his only "emoticon"), Dex                |
| \*lach\*            | laughing                                               | Kayla, Theo (rare)                              |
| \*seufz\*           | sigh                                                   | Kayla (signature)                               |
| \*heul\* / \*freu\* | crying / happy                                         | Kayla / Jess, Pia                               |
| mom                 | Moment                                                 | Jess, Kayla                                     |
| n8 / gn8            | Nacht / gute Nacht                                     | everyone at night                               |
| wb                  | welcome back                                           | Jess, Kayla                                     |
| sry                 | sorry                                                  | Dex; Theo writes it out („sorry", „tschuldige") |
| thx                 | thanks                                                 | everyone                                        |
| gz                  | gratz / Glückwunsch                                    | Dex, Marco                                      |
| np                  | no problem                                             | Dex, Marco                                      |
| cu                  | see you                                                | Jess, Kayla                                     |
| lg / glg            | liebe Grüße / ganz liebe Grüße                         | mail sign-offs (Jess, Kayla, Pia)               |
| ^^ / xD             | smile / laughing face (plain text, not emoticon codes) | Jess, Kayla, Pia                                |

**Spelling habits:** lowercase everything (nouns included) unless shouting; dropped endings („hab", „hätt", „ich geh"); „nich", „is", „ma" (mal), „nen/ne/n" (einen/eine/ein), „grad", „haste/biste/kannste/willste", „vllt" (vielleicht), „iwie" (irgendwie), „8ung" (Achtung) as a joke. Stretch words for drama („neeeein", „MAMAAAA"). English number puns don't work in German („2" for "to/too", „4" for "for", „r"/„u"/„ur"): write „du", „dein", „seid", „zu", „für". Exceptions: „4ever"/„4 life" stayed in German chat and are fine.

**Not 2007 German chat (don't use):** „safe", „lost", „cringe", „sus", „wyld", „digga", „lowkey", „mood", „Ehrenmann", „OK Boomer", „vong … her".

## 4. School mapping

The player and the friends are 15, in **Klasse 9** at a German Gymnasium.

| English                                   | German                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Westfield High (`westfield-high.example`) | „Westfield-Gymnasium" (host unchanged)                                                 |
| Home of the Wildcats                      | „Heimat der Westfield-Wildkatzen"                                                      |
| grade / class (Jess's grade)              | „Klasse 9b"; everyone in the year: „unsere Stufe"                                      |
| homework                                  | „Hausaufgaben" („Hausis" in chat)                                                      |
| test                                      | „Arbeit" in Klasse 9 (chat: „Bio-Arbeit"); „Klausur" for older siblings or Marco's Uni |
| bio cell project                          | „Bio-Referat über die Zelle" (with a model: „Zellmodell")                              |
| written report / index cards              | „Ausarbeitung" / „Karteikarten"                                                        |
| present (a project)                       | „das Referat halten", „vortragen"                                                      |
| first period                              | „erste Stunde"                                                                         |
| Mr Dalton · Mrs/Ms X · Coach X            | „Herr Dalton" · „Frau X" · „Herr X (Sport)"                                            |
| principal                                 | „Schulleiter" („Dr. Hargrove, Schulleiter")                                            |
| grades A–F (B+)                           | German grades 1–6 („ne 2+", „ne Eins", „ne Fünf"); never letter grades                 |
| prom                                      | „Abschlussball"                                                                        |
| detention                                 | „Nachsitzen"                                                                           |
| cafeteria                                 | „Mensa"                                                                                |
| lunch (at school)                         | „große Pause" / „in der Mensa"                                                         |
| homeroom                                  | „morgens in der Klasse" / „in der ersten Stunde"                                       |
| school dance                              | „Schulparty"                                                                           |
| bake sale                                 | „Kuchenbasar"                                                                          |
| science fair                              | „Projektwoche"                                                                         |
| English essay                             | „Deutsch-Aufsatz" (the native-language subject)                                        |
| college (Marco)                           | „Uni"; roommate: „Mitbewohner" (WG)                                                    |
| locker                                    | „Schließfach" (rare at German schools; prefer „Schultasche"/„Federmäppchen")           |
| school bus                                | „Schulbus" / „Bus"                                                                     |

## 5. Storyline glossary (EN → DE)

Use these terms everywhere (chat, mail, files, profiles, sites) so callbacks connect across apps.

### People, pets and places

| English                                                  | German                                  | Notes                                                                        |
| -------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| Jess, Kayla, Dex, Theo, Marco, Pia                       | unchanged                               | friend names never change                                                    |
| Brianna                                                  | Brianna                                 | Kayla's rival                                                                |
| Ziggy (Ziggy Voltz), Kevin the robot                     | unchanged                               | Tinfoil Comets drummer / robot on the CD                                     |
| Derek                                                    | Derek                                   | Velvet Lantern's drummer who keeps quitting                                  |
| Aunt Rita                                                | Tante Rita                              |                                                                              |
| Mom / Dad                                                | Mama / Papa                             | in chat; Mama's mail name is „Mama"                                          |
| Biscuit (the dog)                                        | **Keks**                                | German family dog name                                                       |
| Stardust (Pia's pony queen)                              | **Sternenstaub**                        | „lila mit silbernen haaren und nem stern"                                    |
| Jess's little brother, the dinosaur book, the nightlight | kleiner Bruder, Dinobuch, Nachtlicht    |                                                                              |
| the rec hall                                             | das Jugendzentrum („Juz" in chat)       |                                                                              |
| the Bean Cellar                                          | „Bean Cellar"                           | the café keeps its English name (German cafés did); „der Keller unterm Café" |
| Riverside Arena                                          | Riverside Arena                         |                                                                              |
| the mall                                                 | „in der Stadt" / „Einkaufszentrum"      |                                                                              |
| PixelPoint Computers, HomeStar 3000                      | unchanged; slogan „Ihr Punkt für Pixel" |                                                                              |
| Information Superhighway                                 | „Datenautobahn"                         |                                                                              |

### Storylines

| English                                                            | German                                                   | Notes                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------- |
| Tinfoil Comets                                                     | Tinfoil Comets                                           | band name stays; „die Comets" in chat                                 |
| Tinfoil Comets songs/EP (Hello, Robot; Comet Juice EP; Robot Prom) | unchanged                                                | fictional English band, English titles; German fans sing along anyway |
| the concert                                                        | „das Konzert"                                            |                                                                       |
| radio contest                                                      | „Radio-Gewinnspiel"                                      |                                                                       |
| tickets                                                            | „Karten" (also „Tickets" in Jess's CAPS)                 |                                                                       |
| the sign / TINFOIL COMTES / COMTES 4 LIFE                          | „das Schild" / TINFOIL COMTES / COMTES 4 LIFE            | the typo and the slogan stay as-is                                    |
| ZIGGY MARRY ME                                                     | ZIGGY HEIRATE MICH                                       |                                                                       |
| "(she will sing in the car)"                                       | „(sie wird im auto singen)"                              |                                                                       |
| brownies (bribe)                                                   | Muffins                                                  | „meine berühmten muffins. berühmt bei meinem hund"                    |
| the CD with the robot                                              | „die cd mit dem roboter"                                 |                                                                       |
| the cd-player joke ("too many skips")                              | „warum musste die cd zum arzt? sie hatte nen sprung"     | same joke in profile and chat                                         |
| front row / caught the drumstick                                   | erste Reihe / den Drumstick gefangen                     | „Drumstick" stays (drummers said it)                                  |
| Kayla vs Brianna                                                   | Kayla gegen Brianna                                      |                                                                       |
| personal message / away message / pm                               | „Spruch" (chat), „persönliche Nachricht" (UI)            | „was hat sie für nen spruch drin"                                     |
| IMed me                                                            | „hat mich angeschrieben"                                 |                                                                       |
| striped hoodie                                                     | „der gestreifte Kapuzenpulli" („Hoodie" ok in chat)      |                                                                       |
| sleepover / counter sleepover                                      | „Übernachtungsparty" / „Gegen-Übernachtungsparty"        |                                                                       |
| pink envelopes                                                     | „rosa Umschläge"                                         |                                                                       |
| drama queen / princess                                             | „Drama-Queen" / „Drama-Prinzessin"                       |                                                                       |
| I'm Switzerland                                                    | „ich bin die Schweiz"                                    | works in German too                                                   |
| code red / CODE PINK                                               | „Alarmstufe Rot" / „ALARMSTUFE PINK"                     |                                                                       |
| Dex's kickflip                                                     | „der Kickflip"                                           | „gestanden" = landed                                                  |
| pics or it didnt happen                                            | „fotos oder es is nie passiert"                          | recurring callback, always this wording                               |
| skate video / camcorder / tape                                     | „Skatevideo" / „Camcorder" / „Kassette"                  | „rip" → „ruhe in frieden"                                             |
| "camera by {name}"                                                 | „Kamera: {name}"                                         |                                                                       |
| couples therapy (board)                                            | „paartherapie"                                           |                                                                       |
| bag of peas                                                        | „Tüte Erbsen"                                            |                                                                       |
| the bio cell project                                               | „das Bio-Referat" / „das Zellmodell"                     |                                                                       |
| plant cell / animal cell                                           | Pflanzenzelle / Tierzelle                                |                                                                       |
| jello / lime jello / gelatin                                       | **Wackelpudding** / Waldmeister-Wackelpudding / Gelatine | green, wobbly, very German                                            |
| jello cell                                                         | „Wackelpudding-Zelle"                                    |                                                                       |
| grapes (mitochondria), plum/peach (nucleus)                        | Weintrauben, Pflaume/Pfirsich                            |                                                                       |
| cooler that smells like fish                                       | „Kühlbox, die n bisschen nach fisch riecht"              |                                                                       |
| "a cell under stress"                                              | „eine Zelle unter Stress"                                |                                                                       |
| B+                                                                 | „2+"                                                     |                                                                       |
| piano lesson                                                       | „Klavierunterricht"                                      |                                                                       |
| Velvet Lantern / "and the night shift"                             | Velvet Lantern / „and the Night Shift"                   | band names stay English                                               |
| flyer                                                              | „Flyer"                                                  | used in German                                                        |
| studio session / practice                                          | „Studio" / „Probe"                                       |                                                                       |
| fire code                                                          | „Brandschutz"                                            |                                                                       |
| the bucket ("a second drum") / tambourine                          | der Farbeimer („eine zweite Trommel") / das Tamburin     |                                                                       |
| Thanksgiving (Marco visits)                                        | „an Omas Geburtstag"                                     | no US holidays                                                        |
| pudding cup                                                        | „Puddingbecher"                                          |                                                                       |
| horse quiz / foal / horselet                                       | „Pferde-Quiz" / „Fohlen" / „Pferdchen"                   |                                                                       |
| Pia's ponies                                                       | „Ponys"                                                  |                                                                       |
| pony wedding / pony jail (laundry basket)                          | „Ponyhochzeit" / „Ponyknast" (Wäschekorb)                |                                                                       |
| Pony Paradise (wallpaper unlock)                                   | „Pony-Paradies"                                          |                                                                       |
| detective pia / case closed                                        | „Detektivin Pia" / „Fall abgeschlossen"                  |                                                                       |
| MISSING poster                                                     | „VERMISST-Plakat"                                        |                                                                       |
| pinky promise / pinky swear                                        | „großes Ehrenwort"                                       | not „Indianerehrenwort"                                               |
| glitter / glitter glue / glitter pen                               | Glitzer / Glitzerkleber / Glitzerstift                   |                                                                       |

### The web, mail and spam

| English                                  | German                                                                  | Notes                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Friendspace                              | Friendspace                                                             | site name stays; „ein Ort für Freunde im Orbit"                   |
| Top 8                                    | Top 8                                                                   | stays                                                             |
| comments                                 | „Kommentare"                                                            |                                                                   |
| guestbook                                | „Gästebuch"                                                             |                                                                   |
| friend request                           | „Freundschaftsanfrage"                                                  |                                                                   |
| profile / Edit Profile / About me / mood | Profil / „Profil bearbeiten" / „Über mich" / „Stimmung"                 |                                                                   |
| Comet Chatter (fan newsletter)           | „KOMETEN-KLATSCH"                                                       | keeps `~*~` decorations and issue numbers                         |
| Celeb Gossip 07                          | Celeb Gossip 07                                                         | German gossip-magazine voice: „Exklusiv!", „Schock!", „Wahnsinn!" |
| chain letter                             | „Kettenbrief"                                                           |                                                                   |
| FWD: / RE:                               | „WG:" / „AW:"                                                           | German mail prefixes (AW: from P0-04)                             |
| the girl from the well                   | „das Mädchen aus dem Brunnen"                                           |                                                                   |
| spam: "U have WON …"                     | „Sie haben gewonnen!!!"                                                 | formal „Sie", fake urgency                                        |
| free mp3 player                          | „Gratis MP3-Player"                                                     |                                                                   |
| cheap ringtones                          | „Klingeltöne fürs Handy" („im Spar-Abo")                                | „Handy" is fine for 2007                                          |
| prices in $                              | Euro: „39,99 €", „49,95 €"                                              |                                                                   |
| VirusGuard 2007                          | VirusGuard 2007                                                         | name stays; „IHR COMPUTER IST ZU 87% INFIZIERT!!!", 87 stays 87   |
| threat names (Trojan.DancingHamster.B …) | keep the pattern, translate the joke part („Joke.Kettenbrief.WG.WG.WG") |                                                                   |
| toolbars / smiley packs / screensavers   | „Toolbars" / „Smiley-Pakete" / „Bildschirmschoner"                      |                                                                   |
| phone line / dial-up                     | „Telefonleitung" / „einwählen"                                          |                                                                   |

### v0.4: Friendspace, Pixlog, GlitterCodez

Site names stay (Friendspace, Pixlog, GlitterCodez, band names, track titles, layout ids).

| English                                                                                  | German                                                                                      | Notes                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wall · comments                                                                          | Pinnwand · Kommentare                                                                       |                                                                                                                                                                                                                     |
| bulletins / a bulletin                                                                   | Bulletins / ein Bulletin                                                                    | stays English, like the site                                                                                                                                                                                        |
| Top 8                                                                                    | Top 8                                                                                       | „in deiner top 8", „aus der top 8 rausnehmen", „wieder reinnehmen"                                                                                                                                                  |
| kudos · give kudos                                                                       | Kudos · Kudos geben                                                                         |                                                                                                                                                                                                                     |
| visitors · who visited my profile                                                        | Besucher · Wer war auf meinem Profil                                                        |                                                                                                                                                                                                                     |
| shouts                                                                                   | Shouts                                                                                      |                                                                                                                                                                                                                     |
| layout code(s)                                                                           | Layout-Code(s)                                                                              | „Code kopieren!!", „in dein Profil einfügen"                                                                                                                                                                        |
| photo album(s)                                                                           | Album / Alben                                                                               |                                                                                                                                                                                                                     |
| skin                                                                                     | Skin                                                                                        |                                                                                                                                                                                                                     |
| repost (chain letters, bulletins)                                                        | „weiterschicken"                                                                            | never „reposten"/„posten" (lint)                                                                                                                                                                                    |
| fw: fw: / re: re:                                                                        | „WG: WG:" / „AW: AW:"                                                                       | as in mail                                                                                                                                                                                                          |
| bulletin survey: 20 qs about me                                                          | „bulletin-umfrage: 20 fragen über mich"                                                     |                                                                                                                                                                                                                     |
| NEW PICS on pixlog!!                                                                     | „NEUE FOTOS auf pixlog!!"                                                                   |                                                                                                                                                                                                                     |
| crush test / high score test (chain)                                                     | „SCHWARM-TEST" / „HIGHSCORE-TEST"                                                           | girl / boy variant                                                                                                                                                                                                  |
| Pia's pony club                                                                          | „PIAS PONYCLUB"; Papa „ehrenmitglied", Keks „auf probe"                                     |                                                                                                                                                                                                                     |
| the blur (Dex in his pics)                                                               | „der wischer"                                                                               |                                                                                                                                                                                                                     |
| disco ball mode / star jeans / paw print                                                 | „discokugel-modus" / „sternchenjeans" / „pfotenabdruck"                                     | same as Jess's chats                                                                                                                                                                                                |
| Lakeview Fairgrounds · the duck pond                                                     | „Lakeview Festwiese" · „der Ententeich"                                                     | The Rocket Room stays                                                                                                                                                                                               |
| porridge (Sugarcube Parade)                                                              | „Haferbrei"                                                                                 | the track title „Pleasant Porridge" stays                                                                                                                                                                           |
| tinfoil hat · keytar (Gerald)                                                            | „Alufolienhut" · „Keytar"                                                                   |                                                                                                                                                                                                                     |
| the half-pipe                                                                            | „die Halfpipe"                                                                              | skater word, stays                                                                                                                                                                                                  |
| replaceable apparently (Kayla's pm)                                                      | „~_anscheinend ersetzbar_~"                                                                 |                                                                                                                                                                                                                     |
| BFFS AGAIN / BEST BUDS AGAIN                                                             | „WIEDER BFFS" / „WIEDER BESTE KUMPELS"                                                      | girl / boy                                                                                                                                                                                                          |
| Glitter · Stickers · Cursors (GlitterCodez)                                              | Glitzer · Sticker · Cursor                                                                  | layout names: „Emo Schwarz/Pink", „Pony Pastell", „Leo Luxus", „Regenbogenglitzer", „Herzen 4 Ever", „Sternennacht", „Skater Grunge", „Gamer Grün", „Schachbrett-Punk", „Flammen", „Tarnmuster", „Mitternachtslila" |
| sick layout bro / PWNAGE                                                                 | „fettes layout alter" / „PWNAGE"                                                            | boy blurbs; „PWNAGE" was gamer German too                                                                                                                                                                           |
| Pixlog surveys (this or that · about me · last time)                                     | „das oder das?!" · `~*die ULTIMATIVE über-mich-umfrage*~` · „wann hast du zum letzten mal…" | questions in „du", lowercase                                                                                                                                                                                        |
| u know who u r (L)/(Y)                                                                   | „du weißt wer gemeint is (L)/(Y)"                                                           | Jess and Kayla shouts, emoticon per gender                                                                                                                                                                          |
| Biscuit (as a commenter) · ZIGGY FAN CLUB                                                | „Keks" · „ZIGGY FANCLUB"                                                                    | other extras' screen names (xX_CometGirl_Xx, lipgloss_lexi, ponyprincess_99, Brianna) stay                                                                                                                          |
| mint chip (ice cream) · leg warmers · peace treaty                                       | „Minz-Schoko" · „Stulpen" · „Friedensvertrag"                                               | Kayla's sleepover                                                                                                                                                                                                   |
| sorry treat · case file · suspect #2                                                     | „Entschuldigungs-Leckerli" · „Akte" · „Verdächtige/Verdächtiger Nr. 2"                      | Pia; the suspect is the player, so `g()`                                                                                                                                                                            |
| Marco/Theo/Dex extras: derek (drums) · Aunt Rita · Mom (Theo) · Ry (my bro) · frogfan_02 | „derek (schlagzeug)" · „Tante Rita" · „Mama" · „Ry (mein bruder)" · „froschfan_02"          | same as their Friendspace profiles; Kickflip_Kev, grindrail_gary, sam_grabs, lil_shredder stay                                                                                                                      |
| iconic · the frog named mr dalton · bio partner                                          | „kult" · „herr dalton" (der frosch) · „Bio-Partnerin/Bio-Partner"                           | the partner is the player, so `g()`                                                                                                                                                                                 |

### v0.5: week two (days 6–10)

From `docs/story-week2.md`; W3-01 (chats) set these, W3-02 (mail, sites, social) reuses them.

| English                                                       | German                                                                                  | Notes                                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| the rec hall show · saturday                                  | „die Show im Jugendzentrum" / „im Juz" · „samstag"                                      | the one weekday the English names                                                        |
| bingo took the first date. bingo always wins                  | „bingo hatte den ersten termin. bingo gewinnt immer"                                    | Marco, day 6                                                                             |
| poster (Theo's) · draft A/B · library printer                 | „Poster" · „Entwurf A/B" · „Drucker in der Bibliothek"                                  | the unlock stays `lantern-poster`; „Poster" is what kids said                            |
| lantern. not soup                                             | „laterne. keine suppe"                                                                  | Marco's poster brief, recurring                                                          |
| fan art contest · ticket stub · collage                       | „Fan-Art-Wettbewerb" · „Kartenabriss" · „Collage"                                       |                                                                                          |
| signed setlist · macaroni keytar · I LOST TO PASTA            | „signierte Setlist" · „Makkaroni-Keytar" · „ICH HAB GEGEN NUDELN VERLOREN"              | spacegirl4eva stays                                                                      |
| guitar pick · MARCO THROW A PICK · THE SHRINE                 | „Plektrum" · „MARCO WIRF EIN PLEKTRUM" · „DER SCHREIN"                                  | the new sign (spelled right this time)                                                   |
| Lakeview sold out                                             | „Lakeview Festwiese: ausverkauft"                                                       | same venue as v0.4                                                                       |
| bangs (Kayla)                                                 | „Pony" (the haircut)                                                                    | only in Kayla's own lines (audit: `friend-self-talk`); the player's choices say „frisur" |
| class rep · class rep election · co-reps                      | „Klassensprecherin/Klassensprecher" · „Klassensprecherwahl" · „Co-Klassensprecherinnen" | Kayla and Brianna are both girls                                                         |
| peace treaty suspended. its called POLITICS                   | „Friedensvertrag: ausgesetzt. das nennt man POLITIK"                                    |                                                                                          |
| mystery loaf · NO MORE MYSTERY LOAF                           | „Rätsel-Hackbraten" · „NIE WIEDER RÄTSEL-HACKBRATEN"                                    | the Mensa's mystery dish; the spoiled ballot said „rätsel-hackbraten"                    |
| 61 to 61 · the office                                         | „61 zu 61" · „im SEKRETARIAT" / „beim Schulleiter"                                      |                                                                                          |
| scrunchie · leg warmers · star jeans                          | „Haargummi" · „Stulpen" · „Sternchenjeans"                                              |                                                                                          |
| the bucket (3 songs) · bucket kick                            | „der Farbeimer" („3 songs") · „Eimer-Kick"                                              |                                                                                          |
| setlist meeting · sound check · load-in · crew                | „Setlist-Besprechung" · „Soundcheck" · „Aufbau" · „Crew"                                | load-in crew: „Aufbau-Crew"                                                              |
| the player's song (girl / boy)                                | „laternenherz" / „56k"                                                                  | the titles from the lyrics notebook                                                      |
| 83 people · room fits 80                                      | „83 leute" · „passen 80 rein"                                                           | the numbers stay                                                                         |
| chaperone (Mr Dalton)                                         | „Aufsicht"                                                                              |                                                                                          |
| art wall (Room 12)                                            | „die Kunstwand in Raum 12" („die wand neben der tür")                                   |                                                                                          |
| Operation Hamster · Professor Nibbles · WHY I NEED A HAMSTER  | „Operation Hamster" · „Professor Knabber" · „WARUM ICH EINEN HAMSTER BRAUCHE"           |                                                                                          |
| we'll see                                                     | „mal sehen" („und mal sehen heißt NEIN")                                                |                                                                                          |
| goldfish · pet store at the mall                              | „Goldfisch" · „Zoohandlung im Einkaufszentrum"                                          |                                                                                          |
| Sir Stardust the Second / the 2nd                             | „Sir Sternenstaub der Zweite" / „der 2."                                                | „weil sternenstaub die ERSTE is"                                                         |
| the Westfield Jam · Kev's crew · the jam course               | „der Westfield Jam" · „Kevs Crew" · „der Jam-Parcours"                                  | name stays; a „Skate-Contest". Kev, Sam, Big Mike stay                                   |
| a blank tape that says 2007                                   | „ne leere Kassette, da steht 2007 drauf"                                                |                                                                                          |
| the dragon helmet · the official hype guy                     | „der Drachenhelm" · „der offizielle Anheizer"                                           |                                                                                          |
| maam (Dex to Mom)                                             | „sie" (he says „Sie" to her, twice)                                                     |                                                                                          |
| the late-night call · glitter-sign workshop · a 2nd PAW PRINT | „der Nachtchat" · „Glitzer-Schild-Werkstatt" · „ein 2. PFOTENABDRUCK"                   | girl-only threads                                                                        |
| dude · man (boy)                                              | „alter" · „mann"                                                                        | what a boy hears instead of (L)                                                          |
| VOTE KAYLA FOR CLASS REP (bulletin, mail)                     | „~_WÄHLT KAYLA ZUR KLASSENSPRECHERIN_~"                                                 | W3-02: the day-7 bulletin and mail quote it the same                                     |
| Mystery Loaf · Chef's Surprise Loaf                           | „Rätsel-Hackbraten" · „Überraschungsbraten nach Art des Hauses"                         | the week-two school site and mail; the day-2 site's „Geheimnisbraten" predates this      |
| bangs (others about Kayla)                                    | „Frisur" / „Fransen" · Celeb Gossip: „Pony (die Frisur)"                                | only Kayla says „Pony" about herself (audit)                                             |
| community board · field trip slip · nature center             | „Schwarzes Brett" · „Einverständniserklärung" · „Naturkundezentrum Westfield"           | Westfield High, mail                                                                     |
| doors at 6 · all ages                                         | „Einlass ab 18 Uhr" · „ohne Altersbeschränkung"                                         |                                                                                          |
| BFF bracelets                                                 | „Freundschaftsarmbänder" („BESTE FREU" / „NDINNEN")                                     | Celeb Gossip                                                                             |
| Goldfish Escape · taunt · Zombie Lunchroom 2                  | „Goldfisch-Ausbruch" · „Verhöhnung" · „Zombie-Mensa 2"                                  | CheatCave; the mic works only „verkehrt rum"                                             |
| lens cap OFF · on tape · 3rd at the jam                       | „deckel AB" · „auf kassette" · „3. beim jam"                                            | Kickflip Kings, Dex                                                                      |
| Brenda (the cow)                                              | „Berta"                                                                                 | Celeb Gossip, all days                                                                   |
| Marco's show album                                            | „juz. platz für 80. (83)"                                                               | Pixlog and his day-10 mail                                                               |
| space cadet (the player)                                      | „Weltraumkadettin/Weltraumkadett"                                                       | `g()`                                                                                    |
| lyrics by my cousin                                           | „meine cousine/mein cousin"                                                             | Marco, `g()`                                                                             |

### Chain letters and spam: German 2007 tropes

- **Kettenbriefe:** „Das ist KEIN Fake!!!", „Schick das an 10 Leute in 10 Minuten, sonst …", the tiered reward („5 Leute: …, 10 Leute: dein Schwarm meldet sich, 20 Leute: …"), „Lies das NICHT um Mitternacht", „Ein Mädchen hat das nicht weitergeschickt und …", stacked „WG: WG: WG:" subjects, lots of „!!!!" and smileys.
- **Spam:** „Herzlichen Glückwunsch!!! Sie sind unser 1.000.000. Besucher!!!", „Gratis", „Nur heute!", „Kein Scherz! Kein Spam!", a „kleine Bearbeitungsgebühr" in euros, ringtone and wallpaper subscriptions („Sende SPAR per SMS"), scareware with percentages. Stiff, too-formal German is fine; that's how real spam read.

## 6. Don'ts

- **No anachronisms.** The lint's German list (`src/content/lint.ts`, case-sensitive) blocks: WhatsApp, Instagram, Facebook, Smartphone, Tablet, App/Apps, App-Store, posten/gepostet, Story/Stories, Selfie, Hashtag, streamen/Streaming, DM. Watch the easy traps: "in STORIES" → „in Geschichten"; "post" → „reinstellen"/„schreiben"; "app" → „Programm"; "stream" → „anhören". Also no „googeln", „liken", „teilen" (in the social sense), „Follower", „Feed", „Chat-Verlauf" of an app, „WLAN überall".
- **No real brands, sites or people.** No StudiVZ, SchülerVZ, ICQ, MSN, Knuddels, wer-kennt-wen, Bravo, Jamba, Popstars/DSDS, real bands or celebrities. Use the existing fictional names (Friendspace, Searchly, Celeb Gossip 07, Tinfoil Comets) or invent a `.example` one.
- **No `.de` domains** (or `.com`, `.at`, `.ch` …), even in jokes. Hosts and email addresses stay exactly as in English.
- **PG-13.** No slurs or schoolyard insults („Opfer", „Spast", „schwul" as an insult). „geil", „voll fies", „ätzend" are fine in moderation.
- **No dialect parody.** No Bavarian, Saxon, Kölsch, Berlinerisch spelling, no „Kiezdeutsch". Casual standard German only („nich", „is", „ma" are colloquial, not dialect). „net" is dialect: don't use it.
- **No English left** except loanwords German teens really used in 2007: cool, sorry, lol, okay/ok, chillen, Party, Fan, Flyer, Hoodie, Toolbar, Kickflip, Board, Skatepark, Drumstick, Drama-Queen, Camcorder, Handy, 4ever, adden („danke fürs adden", „hab dich geaddet"). "crush" is borderline → prefer „verknallt" / „Schwarm". "rn", "tmrw", "tbh", "jk" → „grad", „morgen", „ehrlich gesagt", „spaß".
- **No ae/oe/ue/ss substitutes** for ä ö ü ß, except a deliberate chat voice (nobody in the cast has one by default).
- **Quotes:** „…" everywhere, chat included (P2-01 decision). `…` or `...` both fine in chat; prose uses `…`.
- **No gender-star forms, and no neutral workarounds for the player** (see §2): use `g()` with the natural girl and boy forms.
- **No weekday names for story days**, same as English: „heute", „gestern", „Tag 3". Days the English already names (the band site's „DIESEN FREITAG") keep them; Jess counts the concert down in days („is in 4 tagen").
- **No US-only references:** dollars, Thanksgiving, letter grades, homeroom, prom, Halloween trick-or-treat, high-school football, yearbook. Swap them using §4 and §5.

## 7. Parity reminder

`src/content/parity.test.ts` enforces this; the playthrough only works if you follow it.

- **One English line = one German line.** Same number of `lines` per node and the same number of `choices` per node. Pure-action lines (no `text`) stay text-less.
- **Placeholders stay.** Every `{name}`, `{artist}`, `{title}`, `{score}`, `{game}` in the English line appears in the German line (same set, any order).
  - `{game}` renders the German game name („Minen", „Hühnerjagd", „Sternen-Flipper"), so avoid an article that needs a gender: „bei {game}", „{game} gespielt??".
  - `{score}` renders with German separators („1.234").
  - `{name}` can be any name: write „von {name}" or „{name} hat …" instead of the genitive „{name}s".
- **Cultural changes happen inside a line:** rephrase, swap a reference, or merge two short sentences into one line. Never add or drop a line or a choice.
- **Choices:** `text` is what the player sends (the player's own voice: casual „du", lowercase is fine). `label` exists only where the English has one, and stays short (it's a button).
- **Same ids** for scripts, nodes, files and mails; only text changes. Delays, triggers, nudges, winks, status changes and unlocks come from the English module.
- **Presence messages** (`personalMessage`, `days`, `personalMessageChange`) follow the friend's voice too. Presence messages in `days` don't resolve placeholders, same as English.
- Before finishing: `npm run test -- src/content` (parity, lint for `de`, playthrough).
