// German My Documents, part 2 (`src/content/files/personalDocs.ts`): the player's private writing,
// a girl and a boy version per slot (docs/gender.md).
import { g } from '../../gender';
import type { SeedText } from './types';

const POEM_GIRL = `NICHT LESEN. ICH MEINS ERNST.
wenn du pia bist mach das SOFORT wieder zu

<3 ~*~ ohne titel (vorerst) ~*~ <3

du sitzt zwei plätze vor mir
in mathe, dritte stunde
der lehrer redet, ich hör nix
nur dein lachen geht die runde

deine haare machen so nen schwung
wenn du dich umdrehst und fragst
ob irgendwer nen bleistift hat
(ich hab immer nen bleistift) (nen glitzerbleistift)

mein herz klingt wie ein modem
piiiep krrrsch, ich wähl mich ein
und dann heißts: die leitung is besetzt
und ich mach wieder allein

meine hausaufgaben.

<3 <3 <3 ~ ende ~ <3 <3 <3

(der modem-teil is entweder genial oder das schlimmste was je geschrieben wurde)
(T + ? für immer) (nein. das lösch ich) (ich lösch das später)`;

const POEM_BOY = `MEINE WRESTLING-EINLAUFREDE
(für wenn ich profi bin. oder für die gartenshow mit dex)

*licht geht aus*
*die musik setzt ein* (ein gitarrenriff von marco, er hat gesagt er überlegts sich)
*nebelmaschine* (haben wir nich. föhn nehmen?)

MEINE DAMEN UND HERREN
jetzt kommt er den gang runter
mit einem kampfgewicht von
einundvierzig kilo PURER DONNER
aus den harten straßen der sackgasse

DER MODEM-MÄHDRESCHER!!!!!!

*ich zeig auf die menge*
*die menge rastet aus* (pia und keks)

„du dachtest du kannst mich besiegen?
da hast du dich GETÄUSCHT.
ich hab den GANZEN sommer trainiert.
mein finisher heißt DER EINWAHL-ABSTURZ
und wenn ich den mache
hörst du piep krrrsch
und dann bist du OFFLINE.“

*ich zerreiß mein t-shirt* (ein altes. mama sagt NICHT die schul-shirts)

finisher:
- der EINWAHL-ABSTURZ
- die LADEBALKEN-UMKLAMMERUNG
- der STRG-ALT-ZERSTÖRER (dex sagt der name is doof. der name is GENIAL)

(das mit dem seil auf dem trampolin NICHT nochmal machen. der arm tut immer noch weh)`;

const LYRICS_GIRL = `SONGS FÜR VELVET LANTERN
(marco hat gesagt ich darf texte für die band schreiben wenn sie „nicht furchtbar“ sind)

--- song 1: „laternenherz“ ---
mein herz ist eine laterne
aus samt, ganz weich und schwer
ich wollte sie dir schenken
doch ich find sie nich mehr

deine augen sind wie sterne
oder wie ein auto, ganz modern
ich hab von autos keine ahnung
doch ich weiß, du bist so fern

REFRAIN (alle):
oh oh laterne
oh oh licht
velvet lantern
vergiss mich nicht (vergiss mich nicht)

--- song 2: „bushaltestellen-blues“ ---
ich wart an der bushaltestelle
es regnet und regnet sehr
der bus ist mal wieder zu spät
er kommt einfach nich mehr

ich bin so traurig
meine socken sind nass
das is die traurigste bushaltestelle
und das sag ich ohne spaß

--- song 3: „rocksong ohne titel“ ---
yeah
YEAH
(hier gitarrensolo, marco weiß was zu tun is)
yeah

--- notizen ---
- marco hat gesagt song 1 „hat potenzial“. DAS IS EIN JA
- was reimt sich auf laterne. kaserne? laterne kaserne. nein
- vielleicht n song übers konzert im jugendzentrum?? „juz rock“`;

const LYRICS_BOY = `SONGS FÜR VELVET LANTERN
(marco hat gesagt ich darf texte für die band schreiben wenn sie „nicht furchtbar“ sind)

--- song 1: „hausarrest“ ---
mama hat die tastatur
papa hat das telefon
zwei wochen in meim zimmer
zwei wochen ganz ALLEIN

ich habs nich mal kaputt gemacht
das fenster war schon so
(ich habs kaputt gemacht)
(war aber n echt guter ollie)

REFRAIN (alle, LAUT):
hausarrest! hausarrest!
kein fernsehn kein pc
hausarrest! hausarrest!
lasst mich RAUS, ey

--- song 2: „56k“ ---
piiiep krrrsch
ich wähl mich ein
piiiep krrrsch
immer noch am einwähln
meine schwester geht ans telefon
JETZT BIN ICH RAUSGEFLOGEN
(der is punk. marco spielt den schnell)

--- song 3: „der bordstein“ ---
der bordstein an der tanke
der ruft nach mir
ich bin neunmal draufgeflogen
und flieg nochmal, ich schwörs dir
(hier gitarrensolo, marco weiß was zu tun is)

--- song 4: „linie 14“ ---
die 14 is zu spät
die 14 riecht nach fuß
der typ in der letzten reihe
tritt gegen meinen sitz, so n stuss

--- notizen ---
- marco hat gesagt song 2 „hat potenzial“. DAS IS EIN JA
- was reimt sich auf laterne. kaserne? laterne kaserne. nein
- vielleicht n song übers konzert im jugendzentrum?? „juz rock“
- dex sagt song 3 is über ihn. is er NICH. (n bisschen schon)`;

const TOP_8_GIRL = `MEINE FRIENDSPACE TOP 8 (KEINEM ZEIGEN) <3

--- version 1 ---
1. Jess
2. Kayla
3. Brianna
4. Theo
5. Marco
6. Dex
7. Keks (er hat kein profil aber er sollte eins haben)
8. Pia (nein warte das sieht sie doch) ~~Pia~~

--- version 2 (nach der sache mit dem spruch) ---
1. Jess
2. ~~Brianna~~ Kayla
3. ~~Kayla~~ Brianna (nein warte)
4. Theo
5. Marco
6. Dex
7. das Tinfoil-Comets-Fanprofil
8. ???

--- version 3 ---
1. Kayla (sie hat gesagt wenn sie nich #1 is sind wir „geschiedene leute“)
2. Jess (jess sagt es is ihr egal) (es is ihr nich egal)
3. Theo
4. ~~Brianna~~ (Kayla guckt zu)
5. Marco
6. Dex (loggt dex sich überhaupt jemals ein??)
7. Tinfoil Comets
8. Pia (ok GUT sie hat geheult)

--- version 3 1/2 ---
brianna hat in mein gästebuch geschrieben „top 8 oder wir sind keine freundinnen mehr xoxo“
kayla hat direkt drunter geschrieben „top 3 oder wir sind keine freundinnen mehr xoxo“
WARUM SCHREIBEN ALLE DROHUNGEN IN MEIN GÄSTEBUCH

--- version 4 (ENDGÜLTIG) (echt jetzt) ---
1. Jess + Kayla gleichauf (geht unentschieden?? NEIN geht nich)
1. Jess
2. Kayla
3. Theo
4. Marco
5. Dex
6. Brianna (heimlich)
7. Pia
8. Keks (hab ihm ein profil gemacht)

(nein warte wenn ich theo auf 3 setze denkt er dann was??
denkt theo dann was?? merkt er eh nich.
er merkt es DOCH. ok ich lass es so) (<3)`;

const TOP_8_BOY = `MEINE FRIENDSPACE TOP 8 (ENDGÜLTIG final)
sortiert danach wer die besten spiele hat. keine gefühle. nur spiele.

--- version 1 ---
1. Dex (hat ne konsole in seinem ZIMMER)
2. Marco (hat nen PC auf dem Galaxy Raiders 3 auf maximum läuft)
3. Jess (sie hat mich bei Thunder Kart besiegt. EINMAL. sie redet jeden tag davon)
4. Kayla (hat ein karaoke-spiel. zählt das)
5. Brianna (ihr vater hat jedes rennspiel aber sie lässt uns nich spielen)
6. Theo (hat nur schach auf seinem computer)
7. Keks (er hat kein profil aber er sollte eins haben)
8. Pia (hat nur Pony Party Deluxe) ~~Pia~~

--- version 2 (nach der sache mit der LAN-party) ---
1. ~~Dex~~ Marco (er hat mir Ninja Turbo Kombat geliehen)
2. ~~Marco~~ Dex (nein warte)
3. Jess
4. Theo
5. Kayla
6. Brianna
7. das Tinfoil-Comets-Fanprofil
8. ???

--- version 3 ---
DEX GEGEN MARCO
dex: konsole, 4 controller, das skatespiel mit der guten musik
marco: PC, das headset mit mikro, kennt jeden cheat
dex: leiht dir spiele
marco: leiht dir spiele ABER sagt 40 mal „nich zerkratzen“
dex: nie online (loggt dex sich überhaupt jemals ein??)
marco: immer online
...unentschieden. ich HASSE unentschieden

--- version 4 (ENDGÜLTIG) (echt jetzt) ---
1. Dex + Marco gleichauf (geht unentschieden?? NEIN geht nich)
1. Dex
2. Marco
3. Jess (sie guckt nach)
4. Theo
5. Kayla (sie sagt wenn sie nich in den top 5 is „erzählt sie allen was“)
6. Brianna
7. Pia (ok GUT sie hat geheult)
8. Keks (hab ihm ein profil gemacht)

(wenn marco sieht dass er #2 is will er Ninja Turbo Kombat zurück. verstecken)`;

const PACKING_LIST_GIRL = `TINFOIL COMETS KONZERT!!!!!!!!!! <3 <3
mit JESS!!! (sie hat 2 karten!!!)

einpacken:
[x] karte (jess hat sie. JESS ANRUFEN OB SIE SIE WIRKLICH HAT)
[x] ohrstöpsel (mama sagt sonst darf ich nich)
[ ] glitzerschild „COMETS BITTE SPIELT SPACE GIRL“ (braucht mehr glitzer)
[ ] ersatzglitzer
[ ] einwegkamera (27 bilder. gut einteilen)
[ ] 20 € fürs t-shirt + 3 € für was zu trinken
[ ] mamas handy (NICHT VERLIEREN)
[ ] kaugummi
[ ] haarspangen (jess macht mir die haare) (die mit den sternen!!)
[ ] lipgloss (der glitzernde)
[ ] dicker filzstift für autogramme!!!
[ ] snacks für die schlange (wir sind 3 stunden früher da)
[ ] jacke (mama) (zieh ich nich an)

nich vergessen:
- ALLE texte vom neuen album auswendig lernen
- den tanz aus dem video üben
- NICHT HEULEN wenn sie space girl spielen (ich werde heulen)`;

const PACKING_LIST_BOY = `TINFOIL COMETS KONZERT!!!!!!!!!!
mit JESS!!! (sie hat 2 karten!!!)

einpacken:
[x] karte (jess hat sie. JESS ANRUFEN OB SIE SIE WIRKLICH HAT)
[x] ohrstöpsel (marco sagt sonst sind meine ohren „für immer hinüber“. mama sagt das auch)
[ ] schild „ZIGGY WIRF NEN DRUMSTICK“ (große buchstaben. ziggy is weit weg)
[ ] haargel (jess sagt stacheln. jess is für die stacheln zuständig)
[ ] einwegkamera (27 bilder. gut einteilen. diesmal KEINE bilder vom boden)
[ ] 20 € fürs t-shirt + 3 € für was zu trinken
[ ] mamas handy (NICHT VERLIEREN)
[ ] kaugummi
[ ] dicker filzstift für autogramme!!!
[ ] snacks für die schlange (wir sind 3 stunden früher da)
[ ] jacke (mama) (zieh ich nich an)

nich vergessen:
- ALLE texte vom neuen album auswendig lernen (wenigstens den refrain)
- luftschlagzeug üben (NICHT auf mamas töpfen)
- den drumstick fangen. wenn ziggy ihn wirft. er WIRD ihn werfen`;

export const PERSONAL_DOCS: Readonly<Record<string, SeedText>> = {
  'poem-do-not-read': {
    name: g('geheimes gedicht.txt', 'meine_wrestling_einlaufrede.txt'),
    text: g(POEM_GIRL, POEM_BOY),
  },
  'song-lyrics-notebook': {
    name: 'songtexte_notizbuch.txt',
    text: g(LYRICS_GIRL, LYRICS_BOY),
  },
  'top-8-drama': {
    name: g('top 8 drama.txt', 'top 8 (FINAL final).txt'),
    text: g(TOP_8_GIRL, TOP_8_BOY),
  },
  'concert-packing-list': {
    name: 'konzert_packliste.txt',
    text: g(PACKING_LIST_GIRL, PACKING_LIST_BOY),
  },
};
