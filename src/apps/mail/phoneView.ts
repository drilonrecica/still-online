// Mail on a phone (v0.6): one pane at a time instead of Outlook Express's three.

export type MailPhoneView = 'list' | 'message' | 'compose';

/**
 * Which pane fills a phone's Mail window. A draft always wins (Compose is full screen); a message
 * shows full screen while the player is reading one (until Back); otherwise the message list.
 */
export function mailPhoneView({
  composing,
  reading,
  hasSelection,
}: {
  composing: boolean;
  reading: boolean;
  hasSelection: boolean;
}): MailPhoneView {
  if (composing) return 'compose';
  if (reading && hasSelection) return 'message';
  return 'list';
}
