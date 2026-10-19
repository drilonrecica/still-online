// German Recycle Bin (`src/content/files/recycleBin.ts`): still deleted, still embarrassing, a
// girl and a boy version of each of the player's own files (docs/gender.md).
import { g } from '../../gender';
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
mir <3

p.s. die wackelpudding-zelle is die beste idee die jemals wer hatte`;

const CHEAT_CODES = `CHEATCODES!!!!! NICHT PIA SAGEN
(sonst benutzt sie die auf meinem spielstand und sagt dann sie hat gewonnen)

GALAXY RAIDERS 3
- unendlich leben: pause, L + R halten, hoch hoch runter runter drücken
- riesenkopf-modus: auf dem titelbild BIGBRAIN eintippen (is der HAMMER)
- alle schiffe: level 1 schaffen ohne zu schießen (unmöglich) (marco sagt möglich)

THUNDER KART
- regenbogen-kart: beim ladebildschirm select halten
- jess sagt es gibt ne geheime bananenstrecke. JESS LÜGT
- turbostart: gas geben genau wenn die 2 weggeht

NINJA TURBO KOMBAT
- als hausmeister spielen: logo markieren und 7 mal start drücken
- mondschwerkraft: hat dex gesagt. dex sagt nie wie

(marco hat die aus nem forum. manche gehen nich.
der riesenkopf geht. der is der beste)`;

const RAP_LYRICS = `MC MEGABYTE - „WÄHL DICH EIN“ (feat. niemand)

yo
ich hab nen neuen computer, der is schnell wie ein jet
ich bin auf der datenautobahn, ich bin voll korrekt
mein modem macht piep piep, krrsch, ding
wenn ich online bin, bin ich der king

mama sagt eine stunde, ich sag: auf keinen fall
sie sagt „du hast mich gehört“, also sag ich: ok, egal
ich mach hausaufgaben, ich räum mein zimmer auf
dann bin ich wieder online und die menge rastet aus

ich hab n skateboard, ich hab nen highscore
dex steht den kickflip, ich lieg aufm boden davor
marco an der gitarre, ich am mikrofon
megabyte reimt und du kennst das schon

(hier beatbox)
(pia sagt mein beatbox klingt wie keks wenn er niest)

yo yo yo
megabyte is RAUS

-----
notiz an mich: das NIEMALS vortragen. nich ma bei dex.`;

const COMETS_SONGS = `SONGS DIE ICH FÜR TINFOIL COMETS GESCHRIEBEN HAB <3 <3 <3
(wenn nova das jemals liest sterbe ich) (aber im guten sinn)

--- song 1: „glitzer in meinem herz“ ---
in meinem herz is glitzer
und es funkelt nur für dich
auf meinem zimmerboden auch
mama sagt staubsaugen, ich sag: ich nich

oh oh glitzer
funkel die ganze nacht
oh oh glitzer
alles strahlt und lacht

--- song 2: „space girl teil 2“ ---
(die fortsetzung von space girl. die comets haben nich danach gefragt)
ich bin auch ein space girl
meine rakete is rosa
ich flieg zu den sternen
schneller als du so ahnst, ja

--- song 3: „beste freundinnen für immer (jess ihr song)“ ---
du leihst mir deine spangen
ich leih dir mein kleid
wir vertragen uns sofort
nach jedem doofen streit

-----
notiz an mich: die NIEMALS vorsingen. nich ma auf der übernachtungsparty.
(ok vielleicht auf der übernachtungsparty)`;

const DIARY_GIRL = `MEIN TAGEBUCH!!!!!! <3
PRIVAT - BETRETEN VERBOTEN - DAS GILT AUCH FÜR DICH

liebes tagebuch,
heute bin ich 11 geworden!!! ich hab einen roller und ein pferdebuch
gekriegt. pia hat einen luftballon gekriegt, obwohl MEIN geburtstag war.

liebes tagebuch,
ich hab beschlossen, dass ich später tierärztin UND popstar werde.
am wochenende flieg ich ins weltall. und ich krieg ein pferd, das heißt
Sternchen.

liebes tagebuch,
jess und ich haben einen geheimclub gegründet. er heißt Der Geheimclub.
das passwort ist „pudding“. sag keinem das passwort.
wir haben jetzt freundschaftsbänder. meins is rosa, ihrs is lila.

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

const DIARY_BOY = `MEIN TAGEBUCH (DAS IS KEIN TAGEBUCH DAS IS EIN LOGBUCH)
PRIVAT - BETRETEN VERBOTEN - DAS GILT AUCH FÜR DICH

liebes tagebuch,
heute bin ich 11 geworden!!! ich hab einen roller und ein haibuch
gekriegt. pia hat einen luftballon gekriegt, obwohl MEIN geburtstag war.

liebes tagebuch,
ich hab beschlossen, dass ich später stuntman UND profi-skater werde.
am wochenende flieg ich ins weltall.

liebes tagebuch,
dex und ich haben einen geheimclub gegründet. er heißt Der Geheimclub.
das passwort ist „pudding“. sag keinem das passwort.
das clubhaus is der baum bei dex im garten. schwestern verboten.

liebes tagebuch,
mutprobe von dex: für einen euro einen regenwurm essen. ich hab einen
HALBEN gegessen. er hat mir nur 50 cent gegeben. das ist der schlimmste
tag meines ganzen lebens.

liebes tagebuch,
wollte vor der ganzen straße nen ollie vom bordstein machen. voll auf
den hintern gefallen. die alte frau von nebenan hat trotzdem geklatscht.
das is noch schlimmer.

liebes tagebuch,
pia hat das gelesen. PIA HAT DAS GELESEN. pia wenn du das liest, du
schuldest mir einen euro pro seite. (pia HÖR AUF ZU LESEN)

liebes tagebuch,
ich bin zu alt für ein logbuch. das is der letzte eintrag.
ok einer noch. dex und ich bauen ne rampe aus dem alten garagentor.
papa weiß noch nix davon.`;

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
„Butterblume“, sagte sie, „warum weinst du?“
„Weil“, sagte Butterblume, „DU den letzten Zauberapfel gegessen hast.“
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
Butterblume sagte „Ich verzeihe dir“ und sie waren wieder beste
Freundinnen FÜR IMMER UND EWIG.

ENDE

(die fortsetzung kommt bald: PRINZESSIN STERNENSTAUB 2: DIE RACHE DES
STURMS)

ps wer das liest muss 10 von 10 punkten geben`;

export const RECYCLE_BIN: Readonly<Record<string, SeedText>> = {
  'letter-to-theo-never-send': {
    name: g('brief_an_theo_NIE_ABSCHICKEN.txt', 'cheatcodes.txt'),
    text: g(LETTER_TO_THEO, CHEAT_CODES),
  },
  'my-rap-lyrics': {
    name: g('meine_songs_fuer_tinfoil_comets.txt', 'meine_rap_texte.txt'),
    text: g(COMETS_SONGS, RAP_LYRICS),
  },
  'diary-age-11': {
    name: 'tagebuch_mit_11.txt',
    text: g(DIARY_GIRL, DIARY_BOY),
  },
  'pony-fanfic-by-pia': {
    name: 'pony_geschichte_von_pia.txt',
    text: PONY_FANFIC,
  },
};
