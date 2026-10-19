// Recycle Bin: things the player deleted from My Documents (but never emptied the bin). Each of
// the player's own files has a girl and a boy version (docs/gender.md); Pia's fanfic is hers.
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { g } from '../gender';
import { at, seedFile } from './seed';

const LETTER_TO_THEO = `dear theo,

this is a letter that i am never going to send so it doesnt matter
what i write.

i just wanted to say that you are really nice. you are the only person
who laughs at my jokes even the bad ones (the cell wall fence one).
also you always bring markers and you never take the good colors.

when mr dalton paired us for the cell project i acted like i didnt care
but actually i did a little dance in my head.

ok that is all. this is so embarrassing. DELETE DELETE DELETE

from,
me <3

p.s. the jello cell is the best idea anyone has ever had`;

const CHEAT_CODES = `CHEAT CODES!!!!! DONT TELL PIA
(she will use them on my save and then say she won)

GALAXY RAIDERS 3
- infinite lives: pause, hold L + R, press up up down down
- big head mode: type BIGBRAIN at the title screen (it is HILARIOUS)
- all ships: finish level 1 without shooting (impossible) (marco says possible)

THUNDER KART
- rainbow kart: hold select on the loading screen
- jess says there is a secret banana track. JESS IS LYING
- turbo start: press gas right when the 2 goes away

NINJA TURBO KOMBAT
- play as the janitor: highlight the logo and press start 7 times
- moon gravity: dex said it. dex never says how

(marco got these from a forum. some of them dont work.
the big head one works. that one is the best one)`;

const RAP_LYRICS = `MC MEGABYTE - "DIAL IT UP" (feat. nobody)

yo
i got a new computer and it's fast as a jet
i'm on the information superhighway, you bet
my modem goes beep boop, krrsh, ding
when i'm online i am the king

my mom says one hour, i say no way
she says "you heard me" so i say ok
i do my homework, i do my chores
then i'm back online, the crowd ROARS

i got a skateboard, i got a high score
dex lands a kickflip, i land on the floor
marco on guitar, me on the mic
megabyte rhymes and you know that you like

(beatbox here)
(pia says my beatbox sounds like biscuit sneezing)

yo yo yo
megabyte OUT

-----
note to self: NEVER perform this. not even at dex's.`;

const COMETS_SONGS = `SONGS I WROTE 4 TINFOIL COMETS <3 <3 <3
(if nova ever reads this i will die) (in a good way)

--- song 1: "glitter in my heart" ---
there is glitter in my heart
and it's sparkling just for you
there is glitter on my bedroom floor
mom says vacuum, i say ew

oh oh glitter
sparkle all night
oh oh glitter
everything's bright

--- song 2: "space girl part 2" ---
(the sequel to space girl. the comets did not ask for it)
i'm a space girl too
my rocket is pink
i fly to the stars
faster than you think

--- song 3: "best friends forever (jess's song)" ---
you lend me your hair clips
i lend you my pen
we fight about nothing
and then we're friends again

-----
note to self: NEVER sing these. not even at the sleepover.
(ok maybe at the sleepover)`;

const DIARY_GIRL = `MY DIARY!!!!!! <3
PRIVATE PROPERTY - KEEP OUT - THIS MEANS YOU

dear diary,
today i turned 11!!! i got a scooter and a book about horses.
pia got a balloon even though it was MY birthday.

dear diary,
i have decided i will be a famous veterinarian AND a pop star.
on weekends i will be an astronaut. and i will have a horse called Starlight.

dear diary,
jess and i made a secret club. it is called the Secret Club.
the password is "pudding". do not tell anyone the password.
we have matching friendship bracelets now. mine is pink, hers is purple.

dear diary,
today at school i tripped in front of everybody in the lunch line and
my tray went everywhere. this is the worst day of my whole life.
i am never going back. i am going to live in the garden shed.

dear diary,
went back to school. nobody remembered. phew.

dear diary,
i think i am too old for a diary now. this is my last entry.

dear diary,
ok one more. mom made lasagna. it was good.`;

const DIARY_BOY = `MY DIARY (ITS NOT A DIARY ITS A JOURNAL)
PRIVATE PROPERTY - KEEP OUT - THIS MEANS YOU

dear diary,
today i turned 11!!! i got a scooter and a book about sharks.
pia got a balloon even though it was MY birthday.

dear diary,
i have decided i will be a stunt man AND a pro skater.
on weekends i will be an astronaut.

dear diary,
dex and i made a secret club. it is called the Secret Club.
the password is "pudding". do not tell anyone the password.
the clubhouse is the tree in dex's yard. no sisters allowed.

dear diary,
dex dared me to eat a worm for a dollar. i ate HALF a worm.
he only paid me 50 cents. this is the worst day of my whole life.

dear diary,
tried to ollie off the curb in front of the whole street.
landed on my butt. the old lady next door clapped anyway. that is worse.

dear diary,
pia read this. PIA READ THIS. pia if you are reading this you owe me
a dollar for every page. (pia STOP READING)

dear diary,
i am too old for a journal now. this is my last entry.
ok one more. dex and i are building a ramp out of the old garage door.
dad doesnt know yet.`;

const PONY_FANFIC = `PRINCESS STARDUST AND THE STORM OF TEARS
a story by PIA (age 9 3/4)
(i wrote this on your computer bc mine is slow. DONT DELETE IT)

CHAPTER 1: THE BEGINING
Once upon a time in the land of Rainbow Meadow there lived a pony
named Princess Stardust. She had a purple mane and a sparkly horn and
she was the most beutiful pony in the WHOLE land.

But one day a STORM came. It was not a normal storm. It was a storm
of TEARS. All the ponies were crying and nobody knew why!!!!

CHAPTER 2: THE BETRAYAL
Princess Stardust went to her best friend Buttercup Swirl.
"Buttercup Swirl" she said "why are you crying?"
"Because" said Buttercup Swirl "YOU ate the last magic apple."
Princess Stardust gasped. "I would NEVER" she said.
(she did) (but she didnt know it was the last one)

CHAPTER 3: THE STORM GETS WORSE
The storm got so bad that the rainbow broke in half.
Half of the ponies lived on the red side and half lived on the blue side.
They were not allowed to talk to each other.
This went on for 100 years. (or a week)

CHAPTER 4: THE END
Princess Stardust said sorry and planted a new magic apple tree.
Everyone stopped crying. The rainbow fixed itself.
Buttercup Swirl said "I forgive you" and they were best friends again
FOREVER AND EVER.

THE END

(the sequel is coming soon: PRINCESS STARDUST 2: THE REVENGE OF THE
STORM)

ps whoever reads this has to give it 10 out of 10`;

const binned = (
  slug: string,
  name: string,
  text: string,
  created: number,
  deleted: number,
): FsNode =>
  seedFile(
    slug,
    {
      parentId: FS_FOLDERS.recycle,
      deletedFrom: FS_FOLDERS.docs,
      name,
      type: 'txt',
      text,
    },
    created,
    deleted,
  );

export const RECYCLE_BIN: readonly FsNode[] = [
  binned(
    'letter-to-theo-never-send',
    g('letter_to_theo_NEVER_SEND.txt', 'cheat_codes.txt'),
    g(LETTER_TO_THEO, CHEAT_CODES),
    at(2007, 10, 9, 22, 41),
    at(2007, 10, 9, 22, 52),
  ),
  binned(
    'my-rap-lyrics',
    g('songs_i_wrote_4_tinfoil_comets.txt', 'my_rap_lyrics.txt'),
    g(COMETS_SONGS, RAP_LYRICS),
    at(2007, 9, 8, 16, 0),
    at(2007, 9, 8, 16, 34),
  ),
  binned(
    'diary-age-11',
    'diary_age_11.txt',
    g(DIARY_GIRL, DIARY_BOY),
    at(2004, 3, 14, 19, 30),
    at(2007, 9, 1, 13, 12),
  ),
  binned(
    'pony-fanfic-by-pia',
    'pony_fanfic_by_pia.txt',
    PONY_FANFIC,
    at(2007, 9, 22, 18, 15),
    at(2007, 10, 2, 20, 3),
  ),
];
