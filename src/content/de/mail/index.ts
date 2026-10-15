// German mail (`src/content/mail`): same ids, days, senders' addresses and attachments' data as
// English; names, subjects, bodies and attachment text in German.
import type { MailContent } from '../../mail/types';
import { day1Mail } from './day1';
import { day2Mail } from './day2';
import { day3Mail } from './day3';
import { day4Mail } from './day4';
import { day5Mail } from './day5';

export { autoReplies } from './autoReplies';

export const MAIL_CONTENT: readonly MailContent[] = [
  ...day1Mail,
  ...day2Mail,
  ...day3Mail,
  ...day4Mail,
  ...day5Mail,
];
