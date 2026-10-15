// German Recycle Bin (`src/content/files/recycleBin.ts`): still deleted, still embarrassing.
import type { SeedText } from './types';

const LETTER_TO_THEO = `lieber theo,

das is ein brief den ich niemals abschicken werde also is es egal
was ich hier schreibe.

ich wollte nur sagen dass du echt nett bist. du bist der einzige der
über meine witze lacht, sogar über die schlechten (der mit der zellwand
und dem gartenzaun). und du hast immer stifte dabei und nimmst nie die
guten farben.

als herr dalton uns fürs bio-referat zusammen eingeteilt hat hab ich so
getan als wär mir das egal, aber eigentlich hab ich in meinem kopf ein
bisschen getanzt.

ok das wars. das is so peinlich. LÖSCHEN LÖSCHEN LÖSCHEN

von
mir

p.s. die wackelpudding-zelle is die beste idee die jemals wer hatte`;

const RAP_LYRICS = `MC MEGABYTE - „WÄHL DICH EIN" (feat. niemand)

yo
ich hab nen neuen computer, der is schnell wie ein jet
ich bin auf der datenautobahn, ich bin voll korrekt
mein modem macht piep piep, krrsch, ding
wenn ich online bin, bin ich der king

mama sagt eine stunde, ich sag: auf keinen fall
sie sagt „du hast mich gehört", also sag ich: ok, egal
ich mach hausaufgaben, ich räum mein zimmer auf
dann bin ich wieder online und die menge rastet aus

(hier beatbox)
(pia sagt mein beatbox klingt wie keks wenn er niest)

yo yo yo
megabyte is RAUS

-----
notiz an mich: das NIEMALS vortragen. nich ma auf der übernachtungsparty.`;

const DIARY = `MEIN TAGEBUCH!!!!!!
PRIVAT - BETRETEN VERBOTEN - DAS GILT AUCH FÜR DICH

liebes tagebuch,
heute bin ich 11 geworden!!! ich hab einen roller und ein pferdebuch
gekriegt. pia hat einen luftballon gekriegt, obwohl MEIN geburtstag war.

liebes tagebuch,
ich hab beschlossen, dass ich später tiere rette (als beruf) UND popstar
werde. am wochenende flieg ich ins weltall.

liebes tagebuch,
jess und ich haben einen geheimclub gegründet. er heißt Der Geheimclub.
das passwort ist „pudding". sag keinem das passwort.

liebes tagebuch,
heute bin ich in der schlange in der mensa vor ALLEN gestolpert und
mein tablett ist überall rumgeflogen. das ist der schlimmste tag meines
ganzen lebens. ich geh nie wieder hin. ich zieh ins gartenhaus.

liebes tagebuch,
bin doch wieder in die schule gegangen. keiner hat sich dran erinnert. puh.

liebes tagebuch,
ich glaub ich bin jetzt zu alt für ein tagebuch. das ist der letzte eintrag.

liebes tagebuch,
ok noch einer. mama hat lasagne gemacht. war lecker.`;

const PONY_FANFIC = `PRINZESSIN STERNENSTAUB UND DER STURM DER TRÄNEN
eine geschichte von PIA (9 dreiviertel jahre)
(ich hab das auf deinem computer geschrieben weil papas laptop so langsam is. NICHT LÖSCHEN)

KAPITEL 1: DER ANFANK
Es war einmal im Land Regenbogenwiese ein Pony, das hieß Prinzessin
Sternenstaub. Sie hatte eine lila Mähne und ein glitzerndes Horn und
sie war das schönnste Pony im GANZEN Land.

Aber eines Tages kam ein STURM. Es war kein normaler Sturm. Es war ein
Sturm aus TRÄNEN. Alle Ponys haben geweint und keiner wusste warum!!!!

KAPITEL 2: DER VERRAT
Prinzessin Sternenstaub ging zu ihrer besten Freundin Butterblume.
„Butterblume", sagte sie, „warum weinst du?"
„Weil", sagte Butterblume, „DU den letzten Zauberapfel gegessen hast."
Prinzessin Sternenstaub hat nach Luft geschnappt. „Das würde ich NIE
machen", sagte sie.
(sie hat es gemacht) (aber sie wusste nicht dass es der letzte war)

KAPITEL 3: DER STURM WIRD SCHLIMMER
Der Sturm wurde so schlimm, dass der Regenbogen in zwei Hälften
zerbrochen ist. Die eine Hälfte von den Ponys wohnte auf der roten Seite
und die andere Hälfte auf der blauen Seite.
Sie durften nicht miteinander reden.
Das ging 100 Jahre so. (oder eine Woche)

KAPITEL 4: DAS ENDE
Prinzessin Sternenstaub hat sich entschuldigt und einen neuen
Zauberapfelbaum gepflanzt. Alle haben aufgehört zu weinen. Der Regenbogen
hat sich von selbst repariert.
Butterblume sagte „Ich verzeihe dir" und sie waren wieder beste
Freundinnen FÜR IMMER UND EWIG.

ENDE

(die fortsetzung kommt bald: PRINZESSIN STERNENSTAUB 2: DIE RACHE DES
STURMS)

ps wer das liest muss 10 von 10 punkten geben`;

export const RECYCLE_BIN: Readonly<Record<string, SeedText>> = {
  'letter-to-theo-never-send': {
    name: 'brief_an_theo_NIE_ABSCHICKEN.txt',
    text: LETTER_TO_THEO,
  },
  'my-rap-lyrics': { name: 'meine_rap_texte.txt', text: RAP_LYRICS },
  'diary-age-11': { name: 'tagebuch_mit_11.txt', text: DIARY },
  'pony-fanfic-by-pia': {
    name: 'pony_geschichte_von_pia.txt',
    text: PONY_FANFIC,
  },
};
