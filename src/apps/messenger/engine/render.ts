// Render-time text for the language-neutral messenger state (docs/i18n.md → "messenger").
// The engine stores references (script line, choice, away reply) and raw params; these pure
// functions turn them into text for one locale, gender and player name.
import { resolveGender } from '@/content/gender';
import { PLAYLIST } from '@/content/playlist';
import type {
  Choice,
  ContactContent,
  ContactLine,
  LineParams,
  NeutralTranscriptEntry,
  NodeId,
  PersonalMessageRef,
  ScriptId,
  TranscriptEntry,
  TriggerContext,
} from '@/content/types';
import { formatNumber } from '@/i18n/format';
import { translate } from '@/i18n/t';
import type { Locale } from '@/i18n/types';
import type { Gender } from '@/os/types';

/** The raw placeholder values of a trigger context, as stored with a reference. */
export function lineParams(context: TriggerContext): LineParams | undefined {
  const params: LineParams = {};
  if (context.game !== undefined) params.game = context.game;
  if (context.score !== undefined) params.score = context.score;
  if (context.trackId !== undefined) params.trackId = context.trackId;
  return Object.keys(params).length > 0 ? params : undefined;
}

/**
 * Resolves `{name}`, `{artist}`, `{title}`, `{score}` and `{game}`. A placeholder without a value
 * (e.g. `{artist}` outside an `onNowPlaying` script) is left as written so authoring mistakes
 * stay visible.
 */
export function fillPlaceholders(
  text: string,
  params: LineParams | undefined,
  locale: Locale,
  playerName: string,
): string {
  const track =
    params?.trackId === undefined
      ? undefined
      : PLAYLIST.find((t) => t.id === params.trackId);
  const values: Record<string, string | undefined> = {
    name: playerName,
    artist: track?.artist,
    title: track?.title,
    score:
      params?.score === undefined
        ? undefined
        : formatNumber(params.score, locale),
    game:
      params?.game === undefined
        ? undefined
        : translate(locale, `games.${params.game}`),
  };
  return text.replace(
    /\{(name|artist|title|score|game)\}/g,
    (match, key: string) => values[key] ?? match,
  );
}

/** The authored line a reference points at, if the content still has it. */
export function scriptLine(
  content: ContactContent | undefined,
  scriptId: ScriptId,
  nodeId: NodeId,
  lineIndex: number,
): ContactLine | undefined {
  const node = content?.scripts.find((s) => s.id === scriptId)?.nodes[nodeId];
  return node?.lines[lineIndex];
}

/** The authored choice a reference points at, if the content still has it. */
export function scriptChoice(
  content: ContactContent | undefined,
  scriptId: ScriptId,
  nodeId: NodeId,
  choiceIndex: number,
): Choice | undefined {
  const node = content?.scripts.find((s) => s.id === scriptId)?.nodes[nodeId];
  return node && 'choices' in node ? node.choices[choiceIndex] : undefined;
}

/** Authored text as shown: placeholders filled, variants resolved (a no-op on resolved content). */
function shownText(
  text: string,
  params: LineParams | undefined,
  locale: Locale,
  playerName: string,
  gender: Gender,
): string {
  return resolveGender(
    fillPlaceholders(text, params, locale, playerName),
    gender,
  );
}

function render(
  entry: NeutralTranscriptEntry,
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
  gender: Gender,
): TranscriptEntry | null {
  const away = 'whileAway' in entry && entry.whileAway === true;
  const message = (
    from: 'contact' | 'player',
    text: string,
  ): TranscriptEntry => ({
    kind: 'message',
    from,
    text,
    at: entry.at,
    ...(away ? { whileAway: true as const } : {}),
  });
  switch (entry.kind) {
    case 'message':
    case 'nudge':
    case 'wink':
      return entry;
    case 'typed':
      return message('player', entry.text);
    case 'awayReply': {
      const reply = content?.contact.awayReply;
      return reply === undefined
        ? null
        : message('contact', resolveGender(reply, gender));
    }
    case 'line': {
      const { scriptId, nodeId, lineIndex } = entry;
      const text = scriptLine(content, scriptId, nodeId, lineIndex)?.text;
      return text === undefined
        ? null
        : message(
            'contact',
            shownText(text, entry.params, locale, playerName, gender),
          );
    }
    case 'choice': {
      const { scriptId, nodeId, choiceIndex } = entry;
      const choice = scriptChoice(content, scriptId, nodeId, choiceIndex);
      if (!choice) return null;
      const text = shownText(
        choice.text,
        entry.params,
        locale,
        playerName,
        gender,
      );
      return message('player', entry.flavor ? `${text} ${entry.flavor}` : text);
    }
  }
}

interface Rendered {
  content: ContactContent | undefined;
  locale: Locale;
  playerName: string;
  gender: Gender;
  result: TranscriptEntry | null;
}

/** Entries are immutable once stored, so their rendering is cached per entry object. */
const cache = new WeakMap<NeutralTranscriptEntry, Rendered>();

/**
 * One stored entry as views show it, in `locale` for `gender`. `content` is the entry's contact
 * for that locale. Null when the reference no longer resolves (the content dropped that line).
 * Memoized per entry, content, locale, player name and gender.
 */
export function renderEntry(
  entry: NeutralTranscriptEntry,
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
  gender: Gender,
): TranscriptEntry | null {
  const hit = cache.get(entry);
  if (
    hit &&
    hit.content === content &&
    hit.locale === locale &&
    hit.playerName === playerName &&
    hit.gender === gender
  )
    return hit.result;
  const result = render(entry, content, locale, playerName, gender);
  cache.set(entry, { content, locale, playerName, gender, result });
  return result;
}

/** A whole transcript rendered; unresolvable references are left out. */
export function renderTranscript(
  entries: readonly NeutralTranscriptEntry[],
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
  gender: Gender,
): TranscriptEntry[] {
  return entries.flatMap((e) => {
    const r = renderEntry(e, content, locale, playerName, gender);
    return r ? [r] : [];
  });
}

/** A contact's personal message in `locale`; refs that no longer resolve show the initial one. */
export function renderPersonalMessage(
  ref: PersonalMessageRef,
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
  gender: Gender,
): string {
  const initial = resolveGender(content?.contact.personalMessage ?? '', gender);
  if (ref === 'initial') return initial;
  switch (ref.kind) {
    case 'literal':
      return ref.text;
    case 'day': {
      const text = content?.contact.days?.[ref.day]?.personalMessage;
      return text === undefined ? initial : resolveGender(text, gender);
    }
    case 'line': {
      const { scriptId, nodeId, lineIndex } = ref;
      const text = scriptLine(
        content,
        scriptId,
        nodeId,
        lineIndex,
      )?.personalMessageChange;
      return text === undefined
        ? initial
        : shownText(text, ref.params, locale, playerName, gender);
    }
  }
}
