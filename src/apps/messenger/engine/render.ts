// Render-time text for the language-neutral messenger state (docs/i18n.md → "messenger").
// The engine stores references (script line, choice, away reply) and raw params; these pure
// functions turn them into text for one locale and player name.
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

function render(
  entry: NeutralTranscriptEntry,
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
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
      return reply === undefined ? null : message('contact', reply);
    }
    case 'line': {
      const { scriptId, nodeId, lineIndex } = entry;
      const text = scriptLine(content, scriptId, nodeId, lineIndex)?.text;
      return text === undefined
        ? null
        : message(
            'contact',
            fillPlaceholders(text, entry.params, locale, playerName),
          );
    }
    case 'choice': {
      const { scriptId, nodeId, choiceIndex } = entry;
      const choice = scriptChoice(content, scriptId, nodeId, choiceIndex);
      if (!choice) return null;
      const text = fillPlaceholders(
        choice.text,
        entry.params,
        locale,
        playerName,
      );
      return message('player', entry.flavor ? `${text} ${entry.flavor}` : text);
    }
  }
}

interface Rendered {
  content: ContactContent | undefined;
  locale: Locale;
  playerName: string;
  result: TranscriptEntry | null;
}

/** Entries are immutable once stored, so their rendering is cached per entry object. */
const cache = new WeakMap<NeutralTranscriptEntry, Rendered>();

/**
 * One stored entry as views show it, in `locale`. `content` is the entry's contact for that
 * locale. Null when the reference no longer resolves (the content dropped that line). Memoized
 * per entry, content, locale and player name.
 */
export function renderEntry(
  entry: NeutralTranscriptEntry,
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
): TranscriptEntry | null {
  const hit = cache.get(entry);
  if (
    hit &&
    hit.content === content &&
    hit.locale === locale &&
    hit.playerName === playerName
  )
    return hit.result;
  const result = render(entry, content, locale, playerName);
  cache.set(entry, { content, locale, playerName, result });
  return result;
}

/** A whole transcript rendered; unresolvable references are left out. */
export function renderTranscript(
  entries: readonly NeutralTranscriptEntry[],
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
): TranscriptEntry[] {
  return entries.flatMap((e) => {
    const r = renderEntry(e, content, locale, playerName);
    return r ? [r] : [];
  });
}

/** A contact's personal message in `locale`; refs that no longer resolve show the initial one. */
export function renderPersonalMessage(
  ref: PersonalMessageRef,
  content: ContactContent | undefined,
  locale: Locale,
  playerName: string,
): string {
  const initial = content?.contact.personalMessage ?? '';
  if (ref === 'initial') return initial;
  switch (ref.kind) {
    case 'literal':
      return ref.text;
    case 'day':
      return content?.contact.days?.[ref.day]?.personalMessage ?? initial;
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
        : fillPlaceholders(text, ref.params, locale, playerName);
    }
  }
}
