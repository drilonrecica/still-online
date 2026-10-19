// German Top 8 wall lines, same contact ids and order as `src/content/friendspace/top8Reactions`.
import { g } from '../../gender';
import type { Top8Reaction } from '../../friendspace/types';

export const TOP8_REACTIONS: readonly Top8Reaction[] = [
  {
    contactId: 'jess',
    dropped:
      'ICH BIN NICH MEHR IN DEINER TOP 8??? {name} WIE KONNTEST DU :( :( :( (ok mir gehts gut) (mir gehts nich gut)',
    readded: `ICH BIN WIEDER IN DER TOP 8!!! da wo ich HINGEHÖRE!!! du bist ${g('die', 'der')} beste {name} ${g('(L) hdgdl', '(Y)')}`,
  },
  {
    contactId: 'pia',
    dropped:
      'ICH BIN NICHT IN DEINER TOP 8. ich habs mama gesagt. sie hat „oje“ gesagt. das heißt DU KRIEGST ÄRGER',
    readded: g(
      'ok ich bin wieder in deiner top 8. mama sagt du bist ne gute schwester. ich hab gesagt „manchmal“',
      'ok ich bin wieder in deiner top 8. mama sagt du bist n guter bruder. ich hab gesagt „manchmal“',
    ),
  },
  {
    contactId: 'kayla',
    dropped:
      'wow. WOW. so is das also {name}. echte freunde halten zusammen *seufz*',
    readded: `na gut dir is verziehen. NUR weil du mich wieder reingenommen hast ${g('<3', ';)')}`,
  },
  {
    contactId: 'marco',
    dropped:
      'hab die top 8 gesehen. alles gut. tante rita ist nicht gut. ruf sie an',
    readded: 'wieder in der top 8. mach jetzt kein großes ding draus, zwerg',
  },
  {
    contactId: 'theo',
    dropped:
      'ähm. sorry falls ich was gemacht hab. du kannst auch mehr leute rausnehmen wenn du platz brauchst. sorry',
    readded:
      'danke dass du mich wieder in deine top 8 genommen hast. sorry. ich mein. danke :)',
  },
  {
    contactId: 'dex',
    dropped: 'moment war ich in deiner top 8. hm',
    readded: 'wieder in der top 8 oder so. fett',
  },
];
