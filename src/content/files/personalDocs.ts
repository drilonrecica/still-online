// My Documents, part 2: the player's own (very private) writing. Each slot has a girl and a boy
// version (docs/gender.md).
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { g } from '../gender';
import { at, seedText } from './seed';

const POEM_GIRL = `DO NOT READ THIS. I MEAN IT.
if you are pia close this RIGHT NOW

<3 ~*~ untitled (for now) ~*~ <3

you sit two seats in front of me
in third period math
i dont hear what the teacher says
i only hear you laugh

your hair does a little swoosh thing
when you turn around to ask
if anybody has a pencil
(i always have a pencil) (a glitter one)

my heart goes like a dial-up modem
beeeep krrrsh connecting
and then it says the line is busy
and i go back to correcting

my homework.

<3 <3 <3 ~ the end ~ <3 <3 <3

(the modem part is either genius or the worst thing ever written)
(T + ? 4ever) (no. delete that) (i will delete it later)`;

const POEM_BOY = `MY WRESTLING ENTRANCE SPEECH
(for when i am a pro. or for the backyard show with dex)

*lights go out*
*the music hits* (a guitar riff marco plays, he said he would think about it)
*smoke machine* (we dont have one. use the hairdryer?)

LADIES AND GENTLEMEN
coming down the aisle
weighing in at
ninety-one pounds of PURE THUNDER
from the mean streets of the cul-de-sac

THE MODEM MAULER!!!!!!

*i point at the crowd*
*the crowd goes wild* (pia and biscuit)

"you thought you could beat me?
you thought WRONG.
i have been training ALL SUMMER.
my finisher is called the DIAL-UP DROP
and when i hit it
you will hear the beep krrrsh
and then you will be DISCONNECTED."

*i rip my shirt* (an old one. mom said NOT my school shirts)

finishers:
- the DIAL-UP DROP
- the BUFFERING BEARHUG
- the CTRL-ALT-DESTROYER (dex says thats a dumb name. it is a GREAT name)

(do NOT try the top rope thing on the trampoline again. the arm still hurts)`;

const LYRICS_GIRL = `SONGS FOR VELVET LANTERN
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

const LYRICS_BOY = `SONGS FOR VELVET LANTERN
(marco said i can write lyrics for the band if they are "not terrible")

--- song 1: "grounded" ---
mom took the keyboard
dad took the phone
two weeks in my room
two weeks ALONE

i didnt even break it
the window was like that
(i broke it)
(it was a really good ollie though)

CHORUS (everybody, LOUD):
grounded! grounded!
no tv no pc
grounded! grounded!
free me FREE ME

--- song 2: "56k" ---
beeeep krrrsh
im connecting
beeeep krrrsh
still connecting
my sister picked up the phone
NOW IM DISCONNECTED
(this one is punk. marco plays it fast)

--- song 3: "the curb" ---
the curb at the gas station
is calling my name
i fell on it 9 times
i'll fall on it again
(guitar solo here, marco knows what to do)

--- song 4: "bus 14" ---
bus 14 is late
bus 14 smells like feet
the kid in the back row
is kicking my seat

--- notes ---
- marco said song 2 "has potential". THATS A YES
- what rhymes with lantern. pattern? lantern pattern. no
- maybe a song about the rec hall show?? "rec hall rock"
- dex says song 3 is about him. it is NOT about him. (it is a little about him)`;

const TOP_8_GIRL = `MY FRIENDSPACE TOP 8 (DO NOT SHOW ANYONE) <3

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

--- version 3 1/2 ---
brianna signed my guestbook "top 8 or we're not friends xoxo"
kayla signed it "top 3 or we're not friends xoxo" right under it
WHY IS EVERYONE SIGNING MY GUESTBOOK WITH THREATS

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

(no wait if i move theo to 3 will he think something??
will theo think something?? he wont notice.
he WILL notice. ok leaving it) (<3)`;

const TOP_8_BOY = `MY FRIENDSPACE TOP 8 (FINAL final)
ranked by who has the best games. no feelings. just games.

--- version 1 ---
1. Dex (has a console in his ROOM)
2. Marco (has a PC that runs Galaxy Raiders 3 on max)
3. Jess (she beat me at Thunder Kart. ONCE. she talks about it every day)
4. Kayla (has a karaoke game. does that count)
5. Brianna (her dad has every racing game but she wont let us play)
6. Theo (only has chess on his computer)
7. Biscuit (he doesnt have a profile but he should)
8. Pia (only has Pony Party Deluxe) ~~Pia~~

--- version 2 (after the lan thing) ---
1. ~~Dex~~ Marco (he let me borrow Ninja Turbo Kombat)
2. ~~Marco~~ Dex (no wait)
3. Jess
4. Theo
5. Kayla
6. Brianna
7. the Tinfoil Comets fan profile
8. ???

--- version 3 ---
DEX VS MARCO
dex: console, 4 controllers, the skate game with the good soundtrack
marco: PC, the headset with the mic, knows every cheat
dex: lends you games
marco: lends you games BUT says "dont scratch it" 40 times
dex: never online (does dex even log in??)
marco: always online
...its a tie. i HATE ties

--- version 4 (FINAL) (for real) ---
1. Dex + Marco tied (can you tie?? NO you cant)
1. Dex
2. Marco
3. Jess (she'll check)
4. Theo
5. Kayla (she said if she is not in the top 5 she will "tell everyone something")
6. Brianna
7. Pia (ok FINE she cried)
8. Biscuit (made him a profile)

(if marco sees he is #2 he will take Ninja Turbo Kombat back. hide this)`;

const PACKING_LIST_GIRL = `TINFOIL COMETS CONCERT!!!!!!!!!! <3 <3
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
[ ] hair clips (jess is doing my hair) (the star ones!!)
[ ] lip gloss (the sparkly one)
[ ] sharpie for autographs!!!
[ ] snacks for the line (we are going 3 hours early)
[ ] jacket (mom) (i will not wear it)

dont forget:
- learn ALL the words to the new album
- practice the dance from the video
- DO NOT CRY when they play space girl (i will cry)`;

const PACKING_LIST_BOY = `TINFOIL COMETS CONCERT!!!!!!!!!!
with JESS!!! (she has 2 tickets!!!)

pack:
[x] ticket (jess has it. CALL JESS TO CHECK SHE HAS IT)
[x] earplugs (marco said or my ears will "never recover". mom said too)
[ ] sign "ZIGGY THROW A DRUMSTICK" (big letters. ziggy is far away)
[ ] hair gel (jess says spikes. jess is in charge of the spikes)
[ ] disposable camera (27 pics. use wisely. NO pics of the floor this time)
[ ] $20 for a t-shirt + $5 for a soda
[ ] mom's cell phone (DO NOT LOSE IT)
[ ] gum
[ ] sharpie for autographs!!!
[ ] snacks for the line (we are going 3 hours early)
[ ] jacket (mom) (i will not wear it)

dont forget:
- learn ALL the words to the new album (at least the chorus)
- practice air drums (NOT on moms pans)
- catch the drumstick. if ziggy throws it. he WILL throw it`;

export const PERSONAL_DOCS: readonly FsNode[] = [
  seedText(
    'poem-do-not-read',
    FS_FOLDERS.docs,
    g('poem_DO_NOT_READ.txt', 'my_wrestling_entrance_speech.txt'),
    g(POEM_GIRL, POEM_BOY),
    at(2007, 9, 20, 22, 48),
    at(2007, 10, 9, 21, 13),
  ),
  seedText(
    'song-lyrics-notebook',
    FS_FOLDERS.docs,
    'song_lyrics_notebook.txt',
    g(LYRICS_GIRL, LYRICS_BOY),
    at(2007, 9, 14, 17, 22),
    at(2007, 10, 6, 15, 40),
  ),
  seedText(
    'top-8-drama',
    FS_FOLDERS.docs,
    g('top 8 drama.txt', 'top 8 (FINAL final).txt'),
    g(TOP_8_GIRL, TOP_8_BOY),
    at(2007, 9, 25, 20, 1),
    at(2007, 10, 12, 21, 58),
  ),
  seedText(
    'concert-packing-list',
    FS_FOLDERS.docs,
    'concert_packing_list.txt',
    g(PACKING_LIST_GIRL, PACKING_LIST_BOY),
    at(2007, 10, 12, 16, 7),
  ),
];
