// Kayla on Pixlog: ~*drama princess*~. The Brianna saga: the away message (day 1), twin hoodies
// (2), the one-of-a-kind outfits and no invite (3), the plot twist (4), and the sleepover album
// with the same mint chip ice cream (5; the "NEW PICS" bulletin).
import { g } from '../gender';
import type { PixlogProfile } from './types';

export const kaylaPixlog: PixlogProfile = {
  contactId: 'kayla',
  skin: 'bubblegum',
  about:
    '~*~ kayla ~*~ drama PRINCESS (not queen. theres a difference). ' +
    'lip gloss, stripes, sad songs when it rains. i had the striped hoodie FIRST. ' +
    'kudos = love. no kudos = i notice ;)',
  albums: [
    {
      id: 'kayla-one-of-a-kind',
      day: 3,
      title: '~*one of a kind*~',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5211,
            day: 3,
            look: 'long',
            caption: 'outfit #1: NOT a hoodie',
          },
          comments: [
            { day: 3, from: 'lipgloss_lexi', text: 'STUNNING. as always <3' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5212,
            day: 3,
            look: 'long',
            caption: 'outfit #2: leg warmers. try copying THAT',
          },
          comments: [
            { day: 3, from: 'jess', text: 'LEG WARMERS!!! UR SO BRAVE' },
            {
              day: 4,
              from: 'Brianna',
              text: 'cute!! where did u get those?? :)',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5213,
            day: 3,
            caption: 'princess judging outfit #3. she said no',
          },
          comments: [
            {
              day: 3,
              from: 'pia',
              text: 'ur cat is the boss of u. like me and biscuit',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5214,
            day: 3,
            look: 'long',
            caption: 'the striped hoodie. retired. 4 now',
          },
          comments: [
            { day: 3, from: 'theo', text: 'um. i liked the hoodie. sorry' },
            { day: 3, from: 'kayla', text: 'theo. not helping' },
          ],
        },
      ],
    },
    {
      id: 'kayla-sleepover',
      day: 5,
      title: '~*sleepover survivor*~',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5221,
            day: 4,
            caption: 'enemy territory. (it had nice pillows)',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'KAYLA AT BRIANNAS. the world is ending',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5222,
            day: 4,
            caption: 'SAME ICE CREAM. mint chip. we just stared',
          },
          comments: [
            { day: 5, from: 'Brianna', text: 'TWINS lol' },
            {
              day: 5,
              from: 'lipgloss_lexi',
              text: 'omg the SAME one??? thats fate',
            },
            { day: 5, from: 'marco', text: 'mint chip. a solid choice. twice' },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5223,
            day: 4,
            caption: 'scary movie. i was NOT scared. that was a pillow',
          },
          comments: [{ day: 5, from: 'dex', text: 'u were scared' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5224,
            day: 4,
            look: 'long',
            caption: '"cute pajamas" (her words. she has good taste. ugh)',
          },
          comments: [
            {
              day: 5,
              from: 'Brianna',
              text: 'they ARE cute!! no copying tho ;)',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5225,
            day: 4,
            caption: 'her dog. the only one who didnt say sorry 40 times',
          },
          comments: [
            {
              day: 5,
              from: 'pia',
              text: 'is he nicer than biscuit. dont tell biscuit',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5226,
            day: 4,
            caption: '~*peace treaty*~ signed in glitter pen',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'PEACE TREATY!!! i want to be in the next one (L)',
            },
            {
              day: 5,
              from: 'theo',
              text: 'um. this is really nice. sorry, i mean congrats',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'kayla-loyalty',
      day: 1,
      title: '~*loyalty*~',
      body:
        'some ppl need to learn what loyalty means.\n\n' +
        'some ppl write away messages about OTHER ppl and think nobody notices.\n\n' +
        'i notice. i ALWAYS notice. thats all. not naming names ;)',
    },
    {
      id: 'kayla-twins',
      day: 2,
      title: '~*i am nobodys twin*~',
      body:
        'today SOMEONE wore MY striped hoodie. there were 2 at the whole mall. i checked.\n\n' +
        'mr dalton asked if we planned it. in front of the WHOLE bio class.\n\n' +
        'tmrw im wearing something she could NEVER copy. watch this space',
    },
    {
      id: 'kayla-grey',
      day: 3,
      title: '~*some days r just gray*~',
      body:
        'everyone got a pink envelope. EVERYONE.\n\n' +
        'its fine. im FINE. sad songs r playing and it isnt even raining. thats how fine i am.\n\n' +
        `ps thx to the person who listened. u know who u r ${g('(L)', '(Y)')}`,
    },
    {
      id: 'kayla-plot-twist',
      day: 4,
      title: '~*plot twist*~ :O',
      body:
        'so. i delete every email from brianna without reading it. its a policy.\n\n' +
        'turns out one was the sleepover invite. with a SMILEY.\n\n' +
        'and the away message was about her little sister. who copies EVERYTHING.\n\n' +
        'i dont know who i am anymore. the universe owes me an explanation',
    },
  ],
  survey: {
    surveyId: 'about-me',
    answers: [
      'kayla',
      'kay, princess, drama princess (NOT queen)',
      'a secret. but its in spring. send presents',
      'pink. obviously',
      'anything sad. ask me again when it rains',
      'fries. and lip gloss (not to eat)',
      'my striped hoodie. the ORIGINAL',
      '~*some ppl r just jealous*~',
      'not telling ;)',
      'someone copying my haircut',
      'famous. or a judge on a talent show. same thing',
      'loyal. fabulous. misunderstood',
    ],
  },
  shouts: [
    { day: 1, text: 'some ppl need to learn what loyalty means...' },
    { day: 2, text: '~*copycat alert*~' },
    { day: 2, text: 'there were 2 striped hoodies at the whole mall. TWO' },
    { day: 3, text: '~*not invited and NOT crying*~' },
    {
      day: 3,
      text: `some ppl r REAL friends. u know who u r ${g('(L)', '(Y)')}`,
    },
    { day: 4, text: '~*plot twist*~ :O' },
    { day: 5, text: '~*sleepover survivor*~' },
    { day: 5, text: 'mint chip is now "our thing". ugh. kind of cute tho' },
  ],
  kudosToPlayer: [3, 5],
  guestbook: [
    {
      day: 1,
      from: 'lipgloss_lexi',
      text: 'cute page!!! ur pics r PERFECT <3',
    },
    { day: 2, from: 'Brianna', text: 'love the stripes!! :)' },
    {
      day: 3,
      from: 'theo',
      text: 'um. hi kayla. ur page is nice. sorry if this is weird',
    },
    {
      day: 4,
      from: 'pia',
      text: 'can i be in ur top 8. mom said ask nicely. this is nicely',
    },
    {
      day: 5,
      from: 'Brianna',
      text: 'thx 4 coming!! next time i bring cookie dough. u bring mint chip ;)',
    },
    { day: 5, from: 'jess', text: 'KAYLA + BRIANNA = PEACE?!?! (L) (L)' },
  ],
};
