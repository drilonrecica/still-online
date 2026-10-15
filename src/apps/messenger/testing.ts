// Test-only: a contact's stored Messenger state rendered in English, as the views show it.
import type { ContactId, TranscriptEntry } from '@/content/types';
import { getPlayerName } from '@/i18n/settingsText';
import { renderPersonalMessage, renderTranscript } from './engine';
import { getMessengerContent } from './runtime';
import { useMessengerStore } from './store';

const progressOf = (id: ContactId) =>
  useMessengerStore.getState().progress.contacts[id];

export function shownTranscript(id: ContactId): TranscriptEntry[] {
  return renderTranscript(
    progressOf(id)?.transcript ?? [],
    getMessengerContent(id, 'en'),
    'en',
    getPlayerName(),
  );
}

/** The message texts of the rendered transcript (nudges and winks left out). */
export function shownTexts(id: ContactId): string[] {
  return shownTranscript(id).flatMap((e) =>
    e.kind === 'message' ? [e.text] : [],
  );
}

export function shownPersonalMessage(id: ContactId): string {
  return renderPersonalMessage(
    progressOf(id)?.personalMessage ?? 'initial',
    getMessengerContent(id, 'en'),
    'en',
    getPlayerName(),
  );
}
