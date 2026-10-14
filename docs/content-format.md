# Messenger content format

Messenger content is authored as typed TS modules. The types are in `src/content/types.ts`. Each contact lives in `src/content/contacts/<id>.ts` and exports a `ContactContent` (`{ contact, scripts }`). The conversation engine (`src/apps/messenger/engine/`, M2-02) plays the content and stores progress in `src/apps/messenger/store.ts` (persisted as `still-online:v1:messenger`).

## Contact

| Field             | Meaning                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`              | Stable lowercase id. Used as the persistence key and as the chat window's `props.contactId`.               |
| `displayName`     | 2007-style decorations are fine (`~*mika*~ (L)`). Emoticon codes render as emoticons.                      |
| `handle`          | `<name>@livemail.example`. The type only accepts the fictional domain.                                     |
| `avatar`          | `{ kind: 'svg', src }` (original SVG) or `{ kind: 'pattern', seed, colors }` (drawn from seed + 2 colors). |
| `group`           | `Friends`, `School` or `Family`.                                                                           |
| `initialStatus`   | The status the contact signs in with. `offline` means "appear offline" (see below).                        |
| `personalMessage` | Shown in grey italics under the name.                                                                      |
| `signInAfterMs`   | Delay after the player signs in to Messenger. `0` = already online when the list appears.                  |

**Sign-in.** Every contact is offline when the player signs in to Messenger. At `signInAfterMs` the contact signs in with `initialStatus` and gets a "has just signed in" toast. With `0` the contact is already in the list, so there's no toast. A contact that signs in with `offline` is _signed in but appearing offline_: they stay in the Offline group with no toast, but their triggers are armed. When a script later changes their status to something other than `offline`, that counts as signing in for the toast.

## Script

A script is a graph of nodes: `{ id, trigger, start, nodes, repeat? }`. Script ids are unique per contact. Node ids are unique per script.

A **node** has `lines` (contact lines, played in order, may be empty) and exactly one of:

- `choices`: 2–3 `{ text, label?, next }`. `text` is what the player sends. `label` is an optional shorter button caption. `next` is a node id in the same script.
- `end: true`: the script ends once the lines are delivered.

A **contact line** is `{ text?, delayMs, nudge?, statusChange?, personalMessageChange? }`:

1. Wait `delayMs`. It starts when the previous line is delivered, or when the node is entered.
2. If the line has `text`: show the typing indicator for `min(text.length × 40ms, 2500ms)`, then deliver the message.
3. Then apply the line's actions in this order: `nudge` (shake + sound + "… just sent you a nudge!"), `statusChange`, `personalMessageChange`.

A line without `text` is a pure action and has no typing indicator. `statusChange: 'offline'` signs the contact out. Their triggers stay armed and fire once they sign back in.

**Placeholders** in line text, choice text/labels and `personalMessageChange` are listed in `TEXT_PLACEHOLDERS`:

- `{name}` is the player name.
- `{artist}` and `{title}` resolve only in `onNowPlaying` scripts, from the track that fired the trigger.

They are resolved when the line is delivered. The transcript stores the resolved text.

**Emoticons.** The chat window (M2-04) draws these codes as pictures, case-insensitive, in messages, display names and personal messages: `:) :( :D ;) :P :O (Y) (N) <3 (L)`. Other text stays as typed.

## Triggers

| Trigger                                      | Fires                                                                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `{ type: 'onSignIn' }`                       | When the contact signs in, including "appear offline".                                                                                                                                                                   |
| `{ type: 'afterMinutes', minutes }`          | `minutes` after the player signed in to Messenger, counted per page session (a reload restarts it).                                                                                                                      |
| `{ type: 'onNowPlaying', trackId? }`         | On `amplifier:trackChanged`: for that `trackId` only, or for any track if it's omitted.                                                                                                                                  |
| `{ type: 'onPlayerNudge' }`                  | When the player nudges this contact.                                                                                                                                                                                     |
| `{ type: 'afterScript', scriptId, minutes }` | `minutes` after another script **of the same contact** ends: a follow-up conversation. Chains are fine (a follow-up of a follow-up). End times aren't persisted, so after a reload the wait counts from the new sign-in. |

Rules:

- A trigger only starts a script while the contact is signed in. A trigger that fires earlier (e.g. `afterMinutes` before the contact signs in) is queued and starts after sign-in.
- **One script per contact at a time.** A trigger that fires while another script of the same contact is active is added to that contact's `queue` (FIFO), and starts when the active script ends. A script waiting for a player choice stays active. Scripts of different contacts run in parallel.
- **Runs.** By default a script runs at most once ever. With `repeat: true` it can run again after it ends. An `onNowPlaying` script still runs at most once per `trackId`. A trigger for a script that is already active or queued is ignored.

## Progress (persisted)

`MessengerProgress = { player, contacts }`. Only data is stored, never content, which is always read from the modules.

- `player`: `status`, `personalMessage`, `showNowPlaying` (the "Show what I'm listening to" toggle).
- `contacts[id]`:
  - `everSignedIn`, the current `status` and `personalMessage` (as changed by scripts), and `unread`.
  - `active`: `{ scriptId, nodeId, lineIndex, awaitingChoice, context }`. `lineIndex` is the next undelivered line. `context` holds the trigger's values for placeholders.
  - `queue`: `QueuedTrigger[]`.
  - `scripts[scriptId]`: `{ runs, visited, trackIds }`.
  - `transcript`: delivered messages and nudges, `{ kind, from, text?, at }`, where `at` is epoch ms.

**Resume after reload.** Delivered lines are in the transcript, and `lineIndex` points past them. So the engine continues with the next line and never repeats a message. If `awaitingChoice` is true, the choices are shown again. Timers restart: the pending line's `delayMs` and typing time run again from the moment the player signs in, and `afterMinutes` (and `afterScript`, when its target already ran) counts from the new sign-in.

## Engine (M2-02)

`createConversationEngine({ contents, store, scheduler?, getPlayerName?, isChatFocused? })` in `src/apps/messenger/engine/` is plain TS. Time comes from the injected `Scheduler` (`setTimeout`/`clearTimeout`/`now`); the default uses the browser timers, so Vitest fake timers work.

- **Calls:** `signIn()`, `signOut()`, `choose(contactId, index)`, `getChoices(contactId)`, `playerNudge(contactId)`, `nowPlaying({ trackId, artist, title })`, `on/off(event, fn)`, `dispose()`. The engine doesn't listen to the OS event bus: the Messenger UI forwards `amplifier:trackChanged` to `nowPlaying` (M2-07). It doesn't rate-limit nudges either; the chat window does (M2-04).
- **Events:** `contactSignedIn { status, toast }`, `contactSignedOut`, `typingStart`, `typingStop`, `message { from, text }`, `nudge { from }`, `statusChange`, `personalMessageChange`, `choices`, `scriptStarted`, `scriptEnded`, `signedOut`.
- **Store** (`src/apps/messenger/store.ts`): `progress` is persisted. The runtime fields `signedIn`, `online[id]` and `typing[id]` are not, so everyone is offline again after a reload.
- **Returning contacts** sign in with their last status. If that status is `offline` (signed out by a script), they use `initialStatus` instead.
- **Scripts keep playing** after a `statusChange: 'offline'`, so a later line can sign the contact back in.
- **Unread** counts contact messages that arrive while `isChatFocused(id)` is false.

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
    group: 'Friends',
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

## Content lint

`src/content/lint.ts` checks what the types can't: `start`/`next` ids exist, every node is reachable, every node can reach an `end`, script ids are unique, `afterScript` follows an existing other script of the same contact with `minutes > 0`, there are no real-looking emails or URLs, no real product names or post-2007 terms, and `{artist}`/`{title}` appear only in `onNowPlaying` scripts. `src/content/contacts/contacts.test.ts` runs it on every shipped contact.
