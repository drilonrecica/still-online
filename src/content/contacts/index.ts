// Shipped Messenger contacts, in sign-in order. One module per contact.
import type { ContactContent } from '../types';
import { dex } from './dex';
import { jess } from './jess';
import { kayla } from './kayla';
import { marco } from './marco';
import { pia } from './pia';
import { theo } from './theo';

export const contacts: readonly ContactContent[] = [
  jess,
  pia,
  kayla,
  marco,
  theo,
  dex,
];
