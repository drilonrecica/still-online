// My Documents, part 1: school and household files on the family's brand-new computer.
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { at, seedText } from './seed';

const BIO_PROJECT = `CELL PROJECT
by me + Theo
Biology, Mr Dalton, period 3
DUE: friday!!!

=== INTRODUCTION ===
The cell is the smallest unit of life. Everything alive is made of cells,
even you, even me, even Pia (unfortunately).

There are 2 kinds of cells: plant cells and animal cells. Plant cells have
a cell wall which is like a fence and animal cells dont, which is why
animals can move around and plants just stand there.

=== PARTS OF THE CELL ===
1. Nucleus - the boss of the cell. it has the DNA in it.
   (our model: a plum)
2. Cell membrane - the skin of the cell. it decides what comes in and out
   like a bouncer.
3. Mitochondria - the powerhouse of the cell
   TODO ask theo about mitochondria (what does it actually DO besides
   being the powerhouse??? mr dalton will ask)
   (our model: grapes)
4. Cytoplasm - the jelly that everything floats in
   (our model: lime jello lol)
5. Ribosomes - TODO
6. Vacuole - TODO
7. Golgi thing - TODO look up how to spell it

=== OUR MODEL ===
Theo's idea: a giant jello cell!!! in a baking dish.
- lime jello = cytoplasm
- plum = nucleus
- grapes = mitochondria
- sprinkles = ribosomes??
- keep it in Theo's cooler so it doesnt melt on the bus
  (the cooler smells like fish a bit. we will air it out)

=== CONCLUSION ===
In conclusion, cells are`;

const HOMEWORK = `math homework p. 112, ex 1-12

1. 3x + 7 = 22
   3x = 15
   x = 5   (checked it!! 3*5 = 15 + 7 = 22 YES)

2. 5x - 4 = 2x + 11
   3x = 15
   x = 5   (again 5?? is that allowed)

3. 2(x + 3) = 18
   x + 3 = 9
   x = 6

4. x/4 + 2 = 7
   x/4 = 5
   x = 20

5. 7 - 2x = 3x - 8
   15 = 5x
   x = 3

6. a train leaves the station at 60 km/h and another train leaves
   2 hours later at 90 km/h. when does the second train catch up?

   ...why are they both going to the same place
   why didnt they just take one train

7.

8.

9-12: ask jess tomorrow before 1st period`;

const MOM_RULES = `RULES FOR THE NEW COMPUTER
(written by Mom. Yes I know how to type.)

1. ONE HOUR PER DAY!!! Weekends: two hours. Homework does not count
   but I WILL check that it is really homework.
2. No chatting with strangers. If someone you don't know adds you on
   the Messenger, you say no and you tell me.
3. Never give out our address, our phone number or the name of your
   school. Not even to "nice" people. ESPECIALLY not to nice people.
4. Pia gets the computer after dinner on weekdays. No arguing.
5. NO food or drinks at the desk. I am looking at you and your pudding
   cups. The man at the shop said one spilled soda can ruin everything.
6. Do NOT download anything. The man at the shop also said that is how
   you get viruses.
7. The computer goes off at 9:30 PM. I will hear it if it is on.
   (Dad says the modem screeching every night is normal. It is not
   normal. It sounds like a robot fax machine crying.)
8. If the phone is ringing and nobody can get through, it is because
   of the internet. Disconnect when Grandma calls on Sundays.
9. Be kind online. Everything you type, imagine I am reading it.
   Because maybe I am.

Love you,
Mom

p.s. clean your room

p.p.s. this is pia i found this file. ONE HOUR haha. i get it after
dinner. its the RULES`;

const READ_ME_FIRST = `=================================================
     PIXELPOINT COMPUTERS - READ ME FIRST!
     "Your family. Your future. Your PC."
=================================================

Congratulations on your new PixelPoint HomeStar 3000!

Your system:
  * 2.4 GHz processor (blazing fast!)
  * 512 MB of memory
  * 80 GB hard drive (room for 20,000 songs!)
  * 56k modem (the internet is just a phone call away)
  * CD burner + DVD player
  * 2 speakers with REAL BASS

GETTING STARTED
1. Plug the phone cable into the back of the computer AND the wall.
2. Double-click "Connect to the Internet" and listen for the
   friendly connection sounds.
3. Pick up the phone downstairs? You'll be disconnected. That's normal!
4. Please do not put the computer in a cabinet. It gets hot. It
   needs to breathe, just like you.

TIPS FROM YOUR PIXELPOINT TECH TEAM
  * Restarting fixes most problems. Try that first.
  * Save often! Our techs have heard many sad stories.
  * Do not open e-mail attachments from people you don't know,
    even if they say you won a free cruise.
  * Keep magnets away from the computer. Yes, even fridge magnets.

Warranty: 1 year. Coffee damage is not covered.
Questions? Call our helpline: 555-0199 (Mon-Fri, 9-5)
Or visit us at www.pixelpoint.example

Thank you for choosing PixelPoint Computers!
Ask about our extended warranty (and our new mouse pads).`;

const NEW_PC = at(2007, 9, 1, 10, 15);

export const SCHOOL_DOCS: readonly FsNode[] = [
  seedText(
    'bio-project-draft',
    FS_FOLDERS.docs,
    'bio_project_draft.txt',
    BIO_PROJECT,
    at(2007, 10, 8, 19, 4),
    at(2007, 10, 11, 21, 27),
  ),
  seedText(
    'homework-maths',
    FS_FOLDERS.docs,
    'homework_math.txt',
    HOMEWORK,
    at(2007, 10, 10, 18, 40),
    at(2007, 10, 10, 19, 2),
  ),
  seedText(
    'mom-rules',
    FS_FOLDERS.docs,
    'mom_rules_for_the_computer.txt',
    MOM_RULES,
    at(2007, 9, 1, 14, 30),
    at(2007, 9, 2, 17, 55),
  ),
  seedText(
    'read-me-first',
    FS_FOLDERS.docs,
    'READ ME FIRST.txt',
    READ_ME_FIRST,
    NEW_PC,
  ),
];
