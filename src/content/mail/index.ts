// All authored mail, delivered once `day <= currentDay`.
import { day1Mail } from './day1';
import { day2Mail } from './day2';
import { day3Mail } from './day3';
import { day4Mail } from './day4';
import { day5Mail } from './day5';
import type { MailContent } from './types';

export const MAIL_CONTENT: readonly MailContent[] = [
  ...day1Mail,
  ...day2Mail,
  ...day3Mail,
  ...day4Mail,
  ...day5Mail,
];
