// All authored mail, delivered once `day <= currentDay`.
import { day1Mail } from './day1';
import { day2Mail } from './day2';
import { day3Mail } from './day3';
import { day4Mail } from './day4';
import { day5Mail } from './day5';
import { day6Mail } from './day6';
import { day7Mail } from './day7';
import { day8Mail } from './day8';
import { day9Mail } from './day9';
import { day10Mail } from './day10';
import type { MailContent } from './types';

export const MAIL_CONTENT: readonly MailContent[] = [
  ...day1Mail,
  ...day2Mail,
  ...day3Mail,
  ...day4Mail,
  ...day5Mail,
  ...day6Mail,
  ...day7Mail,
  ...day8Mail,
  ...day9Mail,
  ...day10Mail,
];
