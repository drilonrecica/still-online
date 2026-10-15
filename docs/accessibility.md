# Accessibility

`tests/e2e/a11y.spec.ts` runs axe-core (serious and critical violations fail) over the login
screen, desktop, Start menu, Messenger, Amplifier, Explorer (My Computer), Display Properties,
the dial-up dialog, Web Explorer (home, Searchly results, the Tinfoil Comets fan page, Spaceport
home and a profile), Mail, TuneMole, Paint, Snapshot Booth (cartoon mode), Message History, Mines,
Hen Hunt and Star Pinball.

## Keyboard paths

**Mines** — Tab to the *Mine field*. Arrow keys move the cursor (Home/End jump to the row
ends); Space or Enter reveals the cell, or chords on an opened number; F (or M) cycles
flag → ? → none; F2 starts a new game. Tab again reaches the face button and menu.

**Paint** — Tab to the menu bar; Enter opens a menu, Escape closes it. Ctrl+Z/Y undo and redo,
Ctrl+N/O/S new, open, save, Ctrl+A select all, Delete clears a selection, Escape settles it.
The canvas region is focusable (scrollable when zoomed). Drawing itself is pointer-only.

**Web Explorer** — Tab to the Address field, type a URL and press Enter. Links, Back, Forward,
Stop, Refresh and the Favorites pane are real buttons and links; Escape closes the menus. Form
pages (guestbook, Searchly) are plain labelled fields.

**Mail** — Tab to *Send/Recv* and press Enter. Message rows are focusable; Enter opens the
message in the preview, which is itself a focusable, scrollable region.

**Canvas games** — Hen Hunt: arrows aim, Enter shoots, Space reloads, Esc exits. Star Pinball:
Space/Down launch, Z and / flippers, T nudges, Esc exits. Both name the canvas and expose a
once-a-second text status ("Score 120, 8 shells, 74 seconds left") via `aria-describedby`.
