// German contact overlays by contact id; `getContacts('de')` merges them over English.
import type { ContactId, ContactOverlay } from '../../types';
import { dex } from './dex';
import { jess } from './jess';
import { kayla } from './kayla';
import { marco } from './marco';
import { pia } from './pia';
import { theo } from './theo';

export const contactOverlays: Readonly<Record<ContactId, ContactOverlay>> = {
  jess,
  pia,
  kayla,
  marco,
  theo,
  dex,
};
