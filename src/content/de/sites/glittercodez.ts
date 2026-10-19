// German glittercodez.example, same exports, layout ids and extras as `src/content/sites/glittercodez`.
// P4 replaces this with German.
import {
  GLITTERCODEZ_HOST as EN_HOST,
  LAYOUTS as EN_LAYOUTS,
  type LayoutDef,
} from '../../sites/glittercodez';

export const GLITTERCODEZ_HOST = EN_HOST;

export const LAYOUTS: readonly LayoutDef[] = structuredClone(EN_LAYOUTS);
