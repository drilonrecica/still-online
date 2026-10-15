// German My Documents, part 2 (`src/content/files/personalDocs.ts`): the player's private writing.
import type { SeedText } from './types';

const POEM = `NICHT LESEN. ICH MEINS ERNST.
wenn du pia bist mach das SOFORT wieder zu

~*~ ohne titel (vorerst) ~*~

du sitzt zwei plätze vor mir
in mathe, dritte stunde
der lehrer redet, ich hör nix
nur dein lachen geht die runde

deine haare machen so nen schwung
wenn du dich umdrehst und fragst
ob irgendwer nen bleistift hat
(ich hab immer nen bleistift)

mein herz klingt wie ein modem
piiiep krrrsch, ich wähl mich ein
und dann heißts: die leitung is besetzt
und ich mach wieder allein

meine hausaufgaben.

~ ende ~

(der modem-teil is entweder genial oder das schlimmste was je geschrieben wurde)`;

const LYRICS = `SONGS FÜR VELVET LANTERN
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

const TOP_8 = `MEINE FRIENDSPACE TOP 8 (KEINEM ZEIGEN)

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

(nein warte wenn ich theo auf 3 setze denkt er dann was?? merkt er eh nich.
er merkt es DOCH. ok ich lass es so)`;

const PACKING_LIST = `TINFOIL COMETS KONZERT!!!!!!!!!!
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
[ ] haarspangen (jess macht mir die haare)
[ ] dicker filzstift für autogramme!!!
[ ] snacks für die schlange (wir sind 3 stunden früher da)
[ ] jacke (mama) (zieh ich nich an)

nich vergessen:
- ALLE texte vom neuen album auswendig lernen
- den tanz aus dem video üben
- NICHT HEULEN wenn sie space girl spielen (ich werde heulen)`;

export const PERSONAL_DOCS: Readonly<Record<string, SeedText>> = {
  'poem-do-not-read': { name: 'geheimes gedicht.txt', text: POEM },
  'song-lyrics-notebook': { name: 'songtexte_notizbuch.txt', text: LYRICS },
  'top-8-drama': { name: 'top 8 drama.txt', text: TOP_8 },
  'concert-packing-list': {
    name: 'konzert_packliste.txt',
    text: PACKING_LIST,
  },
};
