# still-online v0.1.0

The first playable MVP: a Windows XP–style desktop frozen in 2007, with a messenger full of fictional friends and a Winamp-style player. Runs entirely in the browser.

## Highlights

- Boot and login screens, then a desktop you can actually use.
- An MSN-style **Messenger** where six fictional friends sign in, message you, send nudges, react to what you're listening to and come back with new conversations over time.
- **Amplifier**, an original-skin music player with playlist and visualizer.
- Your name, open windows and Notepad text survive a reload.

## What's in it

- **Shell**: boot, login, Start menu, taskbar and tray (mute, clock), draggable/resizable/minimizable windows, desktop icons, original CSS wallpaper, synthesized startup/logon/logoff/error sounds.
- **Messenger**: contact groups and statuses, personal messages, emoticons, scripted conversations with choices, nudges, sign-in and message toasts.
  - Every friend has follow-up conversations that unlock a few minutes after the previous one ends.
  - Friends waiting for your reply are bolded with a speech bubble, counted in the footer ("6 contacts · 2 waiting"), and their taskbar button flashes orange until you look.
  - "Show what I'm listening to" puts the current Amplifier track in your personal message, whichever you start first, and gives your own message back when the music stops.
- **Amplifier**: five CC BY tracks, play/pause/stop/next/prev, seek, volume, shuffle, repeat, playlist panel, bars/oscilloscope visualizer, keyboard control. Minimized it keeps playing; closing it stops the music.
- **Notepad**, My Computer and Recycle Bin.
- **Quality**: lazy-loaded apps (initial JS about 60 kB gzip), axe-checked accessibility and a keyboard path through the main flow, reduced-motion support, small-screen notice.

## Known issues

- Netlog/MySpace-style profiles and a changing "living world" are not part of this release.
- Not designed for phones or tablets; small screens only get a notice.
- Audio and sounds were verified by tests, not by ear, in the automated review.

## Credits

Everything is original work or CC0 / CC BY 4.0. Music is by Kevin MacLeod (incompetech.com), CC BY 4.0. Full attributions are in [CREDITS.md](../CREDITS.md).

still-online is a fan-made, non-commercial project and is not affiliated with Microsoft, MySpace, Netlog, Winamp or their owners.
