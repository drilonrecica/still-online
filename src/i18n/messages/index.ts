// Every locale's catalog. No store imports, so stores can read catalogs without a cycle.
import type { Locale, Messages } from '../types';
import { de } from './de';
import { en } from './en';

export const MESSAGES: Readonly<Record<Locale, Messages>> = { en, de };
