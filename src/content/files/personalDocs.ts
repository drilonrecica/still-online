// My Documents, part 2: the player's own (very private) writing.
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { at, seedText } from './seed';

const POEM = `DO NOT READ THIS. I MEAN IT.
if you are pia close this RIGHT NOW

~*~ untitled (for now) ~*~

you sit two seats in front of me
in third period maths
i dont hear what the teacher says
i only hear you laugh

your hair does a little swoosh thing
when you turn around to ask
if anybody has a pencil
(i always have a pencil)

my heart goes like a dial-up modem
beeeep krrrsh connecting
and then it says the line is busy
and i go back to correcting

my homework.

~ the end ~

(the modem part is either genius or the worst thing ever written)`;

const LYRICS = `SONGS FOR VELVET LANTERN
(marco said i can write lyrics for the band if they are "not terrible")

--- song 1: "lantern heart" ---
my heart is a lantern
made out of velvet
i wanted to give it to you
but i forgot where i left it

your eyes are like the night sky
or maybe like a car
i dont know much about cars
but i know that you are far

CHORUS (everybody):
oh oh lantern
oh oh light
velvet lantern
all night (all night)

--- song 2: "bus stop blues" ---
waiting at the bus stop
in the pouring rain
the bus is very late
it is late again

i am feeling sad
my socks are feeling wet
this is the saddest bus stop
i have ever met

--- song 3: "untitled rock song" ---
yeah
YEAH
(guitar solo here, marco knows what to do)
yeah

--- notes ---
- marco said song 1 "has potential". THATS A YES
- what rhymes with lantern. pattern? lantern pattern. no
- maybe a song about the rec hall show?? "rec hall rock"`;

const TOP_8 = `MY SPACEPORT TOP 8 (DO NOT SHOW ANYONE)

--- version 1 ---
1. Jess
2. Kayla
3. Brianna
4. Theo
5. Marco
6. Dex
7. Biscuit (he doesnt have a profile but he should)
8. Pia (no wait she will see this) ~~Pia~~

--- version 2 (after the away message thing) ---
1. Jess
2. ~~Brianna~~ Kayla
3. ~~Kayla~~ Brianna (no wait)
4. Theo
5. Marco
6. Dex
7. the Tinfoil Comets fan profile
8. ???

--- version 3 ---
1. Kayla (she said if she is not #1 we are "done")
2. Jess (jess said she does not care) (she cares)
3. Theo
4. ~~Brianna~~ (Kayla is watching)
5. Marco
6. Dex (does dex even log in??)
7. Tinfoil Comets
8. Pia (ok FINE she cried)

--- version 4 (FINAL) (for real) ---
1. Jess + Kayla tied (can you tie?? NO you cant)
1. Jess
2. Kayla
3. Theo
4. Marco
5. Dex
6. Brianna (on the low)
7. Pia
8. Biscuit (made him a profile)

(no wait if i move theo to 3 will he think something?? he wont notice.
he WILL notice. ok leaving it)`;

const PACKING_LIST = `TINFOIL COMETS CONCERT!!!!!!!!!!
with JESS!!! (she has 2 tickets!!!)

pack:
[x] ticket (jess has it. CALL JESS TO CHECK SHE HAS IT)
[x] earplugs (mom said or i cant go)
[ ] glitter sign "COMETS PLZ PLAY SPACE GIRL" (needs more glitter)
[ ] backup glitter
[ ] disposable camera (27 pics. use wisely)
[ ] $20 for a t-shirt + $5 for a soda
[ ] mom's cell phone (DO NOT LOSE IT)
[ ] gum
[ ] hair clips (jess is doing my hair)
[ ] sharpie for autographs!!!
[ ] snacks for the line (we are going 3 hours early)
[ ] jacket (mom) (i will not wear it)

dont forget:
- learn ALL the words to the new album
- practice the dance from the video
- DO NOT CRY when they play space girl (i will cry)`;

export const PERSONAL_DOCS: readonly FsNode[] = [
  seedText(
    'poem-do-not-read',
    FS_FOLDERS.docs,
    'poem_DO_NOT_READ.txt',
    POEM,
    at(2007, 9, 20, 22, 48),
    at(2007, 10, 9, 21, 13),
  ),
  seedText(
    'song-lyrics-notebook',
    FS_FOLDERS.docs,
    'song_lyrics_notebook.txt',
    LYRICS,
    at(2007, 9, 14, 17, 22),
    at(2007, 10, 6, 15, 40),
  ),
  seedText(
    'top-8-drama',
    FS_FOLDERS.docs,
    'top 8 drama.txt',
    TOP_8,
    at(2007, 9, 25, 20, 1),
    at(2007, 10, 12, 21, 58),
  ),
  seedText(
    'concert-packing-list',
    FS_FOLDERS.docs,
    'concert_packing_list.txt',
    PACKING_LIST,
    at(2007, 10, 12, 16, 7),
  ),
];
