# still online v0.3.1

A polish release for the bilingual v0.3.

## Changes

- **Pick your own name.** The login screen no longer logs you on as "Player". Type a name before you start; if an older save still has the default name, you're asked once.
- **Easier language choice.** The language picker on the login screen moved to the middle of the screen and became two big flag buttons (🇬🇧 English, 🇩🇪 Deutsch). The tray badge and Regional and Language Options show the flag too.
- **Faster start.** Only the language you play in is downloaded: English players skip the German text entirely (about 190 kB less JavaScript at start), and German loads on demand when you switch.
- **Celeb Gossip 07 tags survive a language switch.** A `/tag?t=…` page or favorite works in both languages.
- **Mail stays in order.** A new day's mail always appears above the previous day's, even when you start the next day right away.
- **Notepad opens wider**, so the files on your desktop no longer break their lines a few words early.
- **German:** Hühnerjagd and Sternen-Flipper now say „Sie" like the rest of the system; only your friends say „du".
- **Story fix:** Brianna's wall post on Kayla's profile now asks about her email, matching the chat.

## Known issues

- Stories still cover days 1–5; later days keep the day-5 state.
- Files you created (saved attachments, TuneMole downloads, snapshots) keep the language they were made in.
- German voices were reviewed by the project, not by a native-speaker editor; corrections are welcome in the issues.
- Not designed for phones or tablets; small screens only get a notice.

## Auf Deutsch

Ein Feinschliff-Update für v0.3: Sie wählen jetzt immer einen eigenen Namen (kein „Spieler" mehr), die Sprache wählen Sie auf dem Anmeldebildschirm mit großen Flaggen-Schaltflächen, und es wird nur noch die Sprache geladen, in der Sie spielen. Dazu: Tags auf Celeb Gossip 07 funktionieren nach einem Sprachwechsel, die Mails eines neuen Tages stehen immer oben, der Editor öffnet sich breiter, und Hühnerjagd und Sternen-Flipper siezen Sie jetzt.
