# Messenger content format

Messenger content is authored as typed TS modules. The types are in `src/content/types.ts`. Each contact lives in `src/content/contacts/<id>.ts` and exports a `ContactContent` (`{ contact, scripts }`). The conversation engine (`src/apps/messenger/engine/`, M2-02) plays the content and stores progress in `src/apps/messenger/store.ts` (persisted as `still-online:v1:messenger`).

## Contact

| Field             | Meaning                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `id`              | Stable lowercase id. Used as the persistence key and as the chat window's `props.contactId`.                |
| `displayName`     | 2007-style decorations are fine (`~*mika*~ (L)`). Emoticon codes render as emoticons.                       |
| `handle`          | `<name>@livemail.example`. The type only accepts the fictional domain.                                      |
| `avatar`          | `{ kind: 'svg', src }` (original SVG) or `{ kind: 'pattern', seed, colors }` (drawn from seed + 2 colors).  |
| `group`           | `friends`, `school` or `family` (ids; the list shows `messenger.groups.<id>` in the current language).      |
| `initialStatus`   | The status the contact signs in with. `offline` means "appear offline" (see below).                         |
| `personalMessage` | Shown in grey italics under the name.                                                                       |
| `signInAfterMs`   | Delay after the player signs in to Messenger. `0` = already online when the list appears.                   |
| `days?`           | Presence per world day: `{ [day]: { status?, personalMessage? } }`, keys ≥ 2. See "Days" below.             |
| `awayReply?`      | One line said once per world day when the contact messages the player while they are Away. No placeholders. |

**Sign-in.** Every contact is offline when the player signs in to Messenger. At `signInAfterMs` the contact signs in with `initialStatus` and gets a "has just signed in" toast. With `0` the contact is already in the list, so there's no toast. A contact that signs in with `offline` is _signed in but appearing offline_: they stay in the Offline group with no toast, but their triggers are armed. When a script later changes their status to something other than `offline`, that counts as signing in for the toast.

## Script

A script is a graph of nodes: `{ id, trigger, start, nodes, repeat? }`. Script ids are unique per contact. Node ids are unique per script.

A **node** has `lines` (contact lines, played in order, may be empty) and exactly one of:

- `choices`: 2–3 `{ text, label?, next }`. `text` is what the player sends. `label` is an optional shorter button caption. `next` is a node id in the same script.
- `end: true`: the script ends once the lines are delivered.

A **contact line** is `{ text?, delayMs, nudge?, wink?, statusChange?, personalMessageChange?, unlock? }`:

1. Wait `delayMs`. It starts when the previous line is delivered, or when the node is entered.
2. If the line has `text`: show the typing indicator for `min(text.length × 40ms, 2500ms)`, then deliver the message.
3. Then apply the line's actions in this order: `nudge` (shake + sound + "… just sent you a nudge!"), `wink` (one of `WINK_IDS`: `kiss`, `hamster`, `hearts`, `pickle`, `fireworks`, `snowball`; it plays once over the chat, opening it like a nudge without the shake, + "… sent you a wink: Hamster"), `statusChange`, `personalMessageChange`, `unlock` (grants a world unlock, e.g. `'ponies'` shows the hidden "Pony Paradise" wallpaper; ids are listed in `CONTENT_UNLOCKS`).

A line without `text` is a pure action and has no typing indicator. `statusChange: 'offline'` signs the contact out. Their triggers stay armed and fire once they sign back in.

**Placeholders** in line text, choice text/labels and `personalMessageChange` are listed in `TEXT_PLACEHOLDERS`:

- `{name}` is the player name.
- `{artist}` and `{title}` resolve only in `onNowPlaying` scripts, from the track that fired the trigger.
- `{score}` and `{game}` resolve only in `onGameScore` scripts: the score with thousands separators (Mines reports seconds) and the game's name ("Mines", "Hen Hunt", "Star Pinball").

They are resolved at render time (P0-05). The transcript stores a reference to the line plus the raw values (`game` id, `score` number, `trackId`), so `{game}`/`{score}` format per locale and `{name}` is always the player's current name. `{artist}`/`{title}` come from the playlist track with that id.

**Emoticons.** The chat window (M2-04) draws these codes as pictures, case-insensitive, in messages, display names and personal messages: `:) :( :D ;) :P :O (Y) (N) <3 (L)`. Other text stays as typed.

## Triggers

| Trigger                                      | Fires                                                                                                                                                                                                                                                                                    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ type: 'onSignIn' }`                       | When the contact signs in, including "appear offline".                                                                                                                                                                                                                                   |
| `{ type: 'afterMinutes', minutes }`          | `minutes` after the player signed in to Messenger, counted per page session (a reload restarts it).                                                                                                                                                                                      |
| `{ type: 'onNowPlaying', trackId? }`         | On `amplifier:trackChanged`: for that `trackId` only, or for any track if it's omitted.                                                                                                                                                                                                  |
| `{ type: 'onGameScore', game, minScore? }`   | On `game:score` for that game, when `score >= minScore` (raw score; omitted = any). Ignored while the player is signed out of Messenger. Game reactions live in `src/content/contacts/game-reactions.ts`.                                                                                |
| `{ type: 'onPlayerNudge' }`                  | When the player nudges this contact.                                                                                                                                                                                                                                                     |
| `{ type: 'onDay', day }`                     | On Messenger sign-in once the world day is `day` or later (a missed day still fires). Queued until the contact signs in, so it starts after their `onSignIn` scripts. Runs once ever; `repeat` isn't allowed.                                                                            |
| `{ type: 'afterScript', scriptId, minutes }` | `minutes` after another script **of the same contact** ends: a follow-up conversation. Chains are fine (a follow-up of a follow-up). End times aren't persisted, so after a reload the wait counts from the new sign-in.                                                                 |
| `{ type: 'onTop8Dropped' }`                  | The player dropped this contact from their Friendspace Top 8: on the contact's first sign-in on a **later** day than the drop. Once per drop (the Messenger store's `progress.top8` record decides, not `repeat`). Its end puts the `top8Reactions` `dropped` line on the player's wall. |
| `{ type: 'onTop8Readded' }`                  | The player put the contact back after their `onTop8Dropped` script ran: at once if they're online, else on their next sign-in. Once per re-add; a re-add before they reacted just forgets the drop. Its end adds the `readded` wall line.                                                |

Rules:

- A trigger only starts a script while the contact is signed in. A trigger that fires earlier (e.g. `afterMinutes` before the contact signs in) is queued and starts after sign-in.
- **One script per contact at a time.** A trigger that fires while another script of the same contact is active is added to that contact's `queue` (FIFO), and starts when the active script ends. A script waiting for a player choice stays active. Scripts of different contacts run in parallel.
- **Runs.** By default a script runs at most once ever. With `repeat: true` it can run again after it ends. An `onNowPlaying` script still runs at most once per `trackId`. A trigger for a script that is already active or queued is ignored.

## Days

The world day (`src/os/world.ts`) starts at 1 and moves forward by one on a new real date or after a shutdown. Story content covers days 1–5; from day 6 on friends keep their day-5 presence.

- **Day scripts** use the `onDay` trigger. Each day's conversation is its own script. Say "today", "yesterday" or "Day 3", never a weekday.
- **Presence.** Day 1 is the contact's `initialStatus` and `personalMessage`. On the contact's first sign-in of a later day, the engine applies the highest `days` entry with `key <= day` (an unset `status` keeps the usual sign-in status) and stores the day in `presenceDay`. It happens once per day, so a `statusChange` or `personalMessageChange` from a script later that day stays. Presence messages don't resolve placeholders.

## Progress (persisted)

`MessengerProgress = { player, contacts }`. Only data is stored, never content, which is always read from the modules.

- `player`: `status`, `personalMessage`, `showNowPlaying` (the "Show what I'm listening to" toggle).
- `contacts[id]`:
  - `everSignedIn`, the current `status` and `personalMessage` (as changed by scripts and day presence; a `PersonalMessageRef`, see docs/i18n.md), `unread`, and `presenceDay` (the last day whose presence was applied, default 1).
  - `active`: `{ scriptId, nodeId, lineIndex, awaitingChoice, context }`. `lineIndex` is the next undelivered line. `context` holds the trigger's values for placeholders.
  - `queue`: `QueuedTrigger[]`.
  - `scripts[scriptId]`: `{ runs, visited, trackIds }`.
  - `transcript`: delivered entries as references (`line`, `choice`, `awayReply`, `typed`), nudges and winks, plus v0.2 `message` entries with text; `at` is epoch ms. `renderEntry` turns them into text (docs/i18n.md → "messenger").

**Resume after reload.** Delivered lines are in the transcript, and `lineIndex` points past them. So the engine continues with the next line and never repeats a message. If `awaitingChoice` is true, the choices are shown again. Timers restart: the pending line's `delayMs` and typing time run again from the moment the player signs in, and `afterMinutes` (and `afterScript`, when its target already ran) counts from the new sign-in.

## Engine (M2-02)

`createConversationEngine({ contents, store, scheduler?, getPlayerName?, getLocale?, getText?, isChatFocused?, getDay?, onUnlock? })` in `src/apps/messenger/engine/` is plain TS. Time comes from the injected `Scheduler` (`setTimeout`/`clearTimeout`/`now`); the default uses the browser timers, so Vitest fake timers work.

- **Calls:** `signIn()`, `signOut()`, `choose(contactId, index)`, `getChoices(contactId)`, `playerNudge(contactId)`, `playerWink(contactId, wink)`, `nowPlaying({ trackId, artist, title })`, `on/off(event, fn)`, `dispose()`. The engine doesn't listen to the OS event bus: the Messenger UI forwards `amplifier:trackChanged` to `nowPlaying` (M2-07). It doesn't rate-limit nudges either; the chat window does (M2-04).
- **Events:** `contactSignedIn { status, toast }`, `contactSignedOut`, `typingStart`, `typingStop`, `message { from, entry }` (render with `renderEntry`), `nudge { from }`, `wink { from, wink }`, `statusChange`, `personalMessageChange`, `choices`, `scriptStarted`, `scriptEnded`, `signedOut`.
- **Store** (`src/apps/messenger/store.ts`): `progress` is persisted. The runtime fields `signedIn`, `online[id]` and `typing[id]` are not, so everyone is offline again after a reload.
- **Returning contacts** sign in with their last status. If that status is `offline` (signed out by a script), they use `initialStatus` instead.
- **Scripts keep playing** after a `statusChange: 'offline'`, so a later line can sign the contact back in.
- **Unread** counts contact messages that arrive while `isChatFocused(id)` is false.
- **World:** `getDay()` (default `() => 1`) is read on sign-in for `onDay` and presence; `onUnlock(id)` is called when an `unlock` line is delivered. The runtime (`src/apps/messenger/runtime.ts`) wires them to `useWorldStore` (`day`, `unlock(id)`, which emits `world:unlock` once per id).

## Example

A complete contact with an opening script (one branch, two endings) and a repeatable nudge reaction. The same code is in `src/content/example.fixture.ts`, which is type-checked and graph-tested.

```ts
import type { ContactContent } from '@/content/types';

export const mika: ContactContent = {
  contact: {
    id: 'mika',
    displayName: '~*mika*~ (L)',
    handle: 'mika.sunshine@livemail.example',
    avatar: { kind: 'pattern', seed: 'mika', colors: ['#FF9ACB', '#FFE36E'] },
    group: 'friends',
    initialStatus: 'online',
    personalMessage: 'summer cant come soon enough!!',
    signInAfterMs: 20_000,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: 'heyyy {name}!!', delayMs: 1500, nudge: true },
            { text: 'r u coming 2 the lake on saturday? :D', delayMs: 800 },
          ],
          choices: [
            { text: 'yeah totally!! what time?', label: 'Yes!', next: 'yes' },
            { text: 'cant, grounded :(', label: 'Grounded', next: 'no' },
          ],
        },
        yes: {
          lines: [
            { text: 'like 2ish, bring ur cd player', delayMs: 1200 },
            {
              text: 'brb mom needs the phone',
              delayMs: 600,
              statusChange: 'away',
            },
          ],
          end: true,
        },
        no: {
          lines: [
            { text: 'nooo :( thats so unfair', delayMs: 1000 },
            {
              delayMs: 400,
              personalMessageChange: 'lake trip minus {name} :(',
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'nudged',
      trigger: { type: 'onPlayerNudge' },
      start: 'ow',
      repeat: true,
      nodes: {
        ow: { lines: [{ text: 'OW lol stop :P', delayMs: 500 }], end: true },
      },
    },
  ],
};
```

## German overlays (v0.3)

English content in `src/content/**` is the structural source of truth. German lives in `src/content/de/**` with the **same ids** and is merged onto the English at render time (`src/content/locale.ts`). The overlay model is in [i18n.md](i18n.md) → "Content per locale"; the voices and style are in [localization-de.md](localization-de.md).

Parity rules, enforced by `src/content/parity.test.ts`:

- One English line is one German line, and the same number of `choices` per node. Lines without `text` (pure actions) stay text-less.
- Every placeholder (`{name}`, `{artist}`, `{title}`, `{score}`, `{game}`) in the English line appears in the German one.
- Scripts, nodes, files and mails keep their ids. Triggers, delays, nudges, winks, status changes and unlocks come from the English module; only text is overlaid.
- Mail is written as full `MailContent` objects whose ids, days, addresses and attachment data match the English (a test pins this).
- `src/content/fallback.test.ts` proves no English fallback is reachable in German.

Run `npm run test -- src/content` after changing either language. The lint below runs on both.

## Content lint

`src/content/lint.ts` checks what the types can't: `start`/`next` ids exist, every node is reachable, every node can reach an `end`, script ids are unique, `afterScript` follows an existing other script of the same contact with `minutes > 0`, there are no real-looking emails or URLs, no real product names or post-2007 terms, `{artist}`/`{title}` appear only in `onNowPlaying` scripts and `{score}`/`{game}` only in `onGameScore` scripts, `onGameScore` names a known game with `minScore >= 0`, a contact has at most one `onTop8Dropped` and one `onTop8Readded` script, `onDay` days and `days` keys are whole days ≥ 2, `onDay` scripts don't `repeat`, `days` personal messages have no placeholders, every `unlock` is in `CONTENT_UNLOCKS`, and every `wink` is in `WINK_IDS`. `src/content/contacts/contacts.test.ts` runs it on every shipped contact.
