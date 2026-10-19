// Dex on Pixlog: few words, always away. Filming at the park, Ry took the pics (day 2; album and the
// "new pics" bulletin), the camcorder eats the tape (3), the kickflip with no camera (4), and the
// 30-second premiere in his living room (5; album).
import { g } from '../gender';
import type { PixlogProfile } from './types';

export const dexPixlog: PixlogProfile = {
  contactId: 'dex',
  skin: 'orange',
  about:
    'dex. i skate. ry made me this page. i dont know how to change the color. ' +
    'pics r mostly blurs. thats my style now. if i dont answer im at the park',
  albums: [
    {
      id: 'dex-filming',
      day: 2,
      title: 'filming day. ry took these',
      photos: [
        {
          photo: {
            scene: 'trip',
            seed: 5601,
            caption: 'the park by the school. after the buses leave its ours',
          },
          comments: [
            {
              day: 2,
              from: 'Kickflip_Kev',
              text: 'sick. can i put these on the site',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5602,
            look: 'short',
            caption: 'me + the camcorder. it has a handle on top',
          },
          comments: [
            { day: 2, from: 'Ry (my bro)', text: 'MY camcorder' },
            { day: 2, from: 'jess', text: 'DIRECTOR DEX!!!' },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5603,
            caption: 'me. im the blur on the left',
          },
          comments: [
            { day: 2, from: 'jess', text: 'DEX WHERE R U IN THIS' },
            { day: 2, from: 'dex', text: 'left' },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5604,
            caption: 'fall 17 of 40. ppl clapped. for the fall',
          },
          comments: [
            { day: 2, from: 'kayla', text: 'omg r u ok?? :(' },
            {
              day: 2,
              from: 'theo',
              text: 'i was by the swings. i didnt want to walk in the shot. sorry',
            },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5605,
            caption: 'some guy skated thru the shot and fell 2. hes in it now',
          },
          comments: [
            {
              day: 2,
              from: 'grindrail_gary',
              text: 'that guy was me. pls delete',
            },
            { day: 3, from: 'marco', text: 'cast him' },
          ],
        },
      ],
    },
    {
      id: 'dex-premiere',
      day: 5,
      title: 'world premiere (my living room)',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5611,
            caption: 'the premiere. 1 couch. 1 tv. 30 sec',
          },
          comments: [
            {
              day: 5,
              from: 'sam_grabs',
              text: 'brought snacks. as instructed',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5612,
            caption: 'ry hooking up the tape. took him an hour',
          },
          comments: [{ day: 5, from: 'Ry (my bro)', text: 'ur welcome' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5613,
            look: 'short',
            caption: 'me. the director. no refunds',
          },
          comments: [
            {
              day: 5,
              from: 'pia',
              text: 'my pony could do a kickflip. probably. she is very talented',
            },
            { day: 5, from: 'kayla', text: 'mr director ~*sooo cool*~ (L)' },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5614,
            caption:
              'the spot where i landed it. no camera that day. just the spot',
          },
          comments: [
            {
              day: 5,
              from: 'lil_shredder',
              text: 'I WAS THERE!!! i saw it!!! my mom says hi again',
            },
            { day: 5, from: 'marco', text: 'good spot' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'dex-filming-day',
      day: 2,
      title: 'filming',
      body:
        'found the camcorder charger. it was in the microwave box. dont ask\n\n' +
        'filmed at the park all day. 2 hours of tape. 40 falls. i counted\n\n' +
        'ry took pics. im the blur',
    },
    {
      id: 'dex-rip-tape',
      day: 3,
      title: 'rip tape #1',
      body:
        'the camcorder ate the tape. like spaghetti\n\n' +
        '1998-2007. it lived a long life\n\n' +
        'bro has 1 more tape. says 1999 on it. newer so better',
    },
    {
      id: 'dex-landed-it',
      day: 4,
      title: 'landed it',
      body:
        'kickflip. clean. rolled away and everything\n\n' +
        'camera: in my bag. lens cap on\n\n' +
        'a little kid saw it. he said whoa. that counts',
    },
    {
      id: 'dex-premiere-post',
      day: 5,
      title: 'its done',
      body:
        'the video. 30 sec. its kind of a blur\n\n' +
        'second 22. thats the kickflip. u cant see it but u can hear it\n\n' +
        'kev put it on kickflipkings.example/video. it buffers. a lot',
    },
  ],
  survey: {
    surveyId: 'last-time',
    answers: [
      'ry fell off the couch. he says he didnt',
      'came home late. the park doesnt have a clock',
      'to my board. it said no',
      'never. i fall asleep in my shoes',
      'frozen peas. they were for my elbow. i ate some',
      'a wheel. it rolled into the creek. its free now',
      'grip tape. from me. for my board',
      'never. ry sings in the car tho',
      'at kevs. skate tapes til 3am',
      'dont have any. i have a board',
    ],
  },
  shouts: [
    { day: 1, text: 'skating. leave a msg' },
    { day: 1, text: 'landed a kickflip. bros camera died. u gotta believe me' },
    { day: 2, text: 'found the charger. ACTION' },
    { day: 2, text: 'filming at the park. huge camcorder = me' },
    { day: 3, text: 'rip tape #1 (1998-2007)' },
    { day: 4, text: 'landed it. camera: in my bag' },
    { day: 5, text: 'world premiere. 30 sec. no refunds' },
    {
      day: 5,
      text: g(
        'theres a special thanks in the credits. its the clearest shot in the video',
        'theres a special thanks in the credits. next video ur in it. bring a board',
      ),
    },
  ],
  kudosToPlayer: [2, 5],
  guestbook: [
    {
      day: 1,
      from: 'jess',
      text: 'DEX!!! SIGN MY GUESTBOOK BACK!!! ur ALWAYS away!!!',
    },
    {
      day: 2,
      from: 'Kickflip_Kev',
      text: 'sick pics. the blur is very u',
    },
    {
      day: 3,
      from: 'Ry (my bro)',
      text: 'that tape was older than u. show some respect',
    },
    {
      day: 4,
      from: 'lil_shredder',
      text: 'U DID IT!!! i saw!!! i told my whole class',
    },
    {
      day: 5,
      from: 'pia',
      text: 'dex is the video about ponies. it should be. thats my review',
    },
  ],
};
