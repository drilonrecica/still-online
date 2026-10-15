// Kayla's German Friendspace profile: pink glitter, Drama-Prinzessin, *seufz*. The Brianna saga on her
// wall follows the same days as English.
import { kaylaProfile as en } from '../../profiles/kayla';
import type { ProfileContent } from '../../profiles/types';

export const kaylaProfile: ProfileContent = {
  ...en,
  headline: '~*manche leute sind halt neidisch*~',
  mood: { text: 'fabelhaft', emoticon: ';)' },
  aboutMe:
    '~*~ willkommen auf meiner seite ~*~ ich bin kayla. ich bin KEINE drama-queen. ich bin ne drama-PRINZESSIN. das is ein unterschied *seufz* ' +
    'ich liebe lipgloss, glitzer, traurige lieder wenns regnet und meinen gestreiften kapuzenpulli (ICH HATTE IHN ZUERST). ' +
    'wenn du das liest bist du entweder mit mir befreundet oder du checkst alle 5 min meine seite. so oder so hi ;) ' +
    'echte freunde bleiben. falsche fliegen aus meinen top 8. und NEIN du kommst nich in meine top 8, nur weil du fragst',
  wantToMeet:
    'leute die TREU sind. und wer auch immer lipgloss erfunden hat, damit ich danke sagen kann',
  interests: [
    {
      label: 'Musik',
      text: 'alles was traurig is. oder alles wo man tanzen kann. kommt auf den tag an',
    },
    {
      label: 'Filme',
      text: 'die wo das mädchen ihre rache kriegt UND den typen',
    },
    { label: 'Fernsehen', text: 'realityshows. das is recherche' },
    {
      label: 'Bücher',
      text: 'mein tagebuch. das is privat. hör auf zu fragen',
    },
    { label: 'Helden', text: 'meine mama. und alle, denen streifen stehen' },
  ],
  top8: [
    { kind: 'player' },
    { kind: 'contact', id: 'jess' },
    { kind: 'extra', name: 'lipgloss_lexi', seed: 'lipglosslexi' },
    { kind: 'contact', id: 'theo' },
    { kind: 'contact', id: 'dex' },
    { kind: 'extra', name: 'Prinzessin (meine katze)', seed: 'princesscat' },
    { kind: 'contact', id: 'pia' },
    { kind: 'contact', id: 'marco' },
  ],
  comments: [
    {
      day: 1,
      from: 'lipgloss_lexi',
      text: 'süßes bild!!!! deine haare sind PERFEKT <3',
    },
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'KAYLA!!! ICH HAB KARTEN GEWONNEN!!! ok tschüss',
    },
    { day: 2, from: 'Brianna', text: 'süßer hoodie ;)' },
    {
      day: 2,
      from: 'jess',
      contactId: 'jess',
      text: 'du und brianna wart heute ZWILLINGE lol. gleicher hoodie. gleiches gesicht',
    },
    {
      day: 3,
      from: 'theo',
      contactId: 'theo',
      text: 'ähm. tut mir leid wegen der übernachtungsparty. ich wurde auch nicht eingeladen. nicht dass das dasselbe ist…',
    },
    {
      day: 3,
      from: 'lipgloss_lexi',
      text: 'deine übernachtungsparty wird 10x besser. 2 sorten eis!!!',
    },
    {
      day: 4,
      from: 'Brianna',
      text: 'hast du meine mail bekommen?? ich hoff du kommst samstag!! :)',
    },
    {
      day: 4,
      from: 'pia',
      contactId: 'pia',
      text: 'deine haare sind schön. sag keinem dass ich das gesagt hab',
    },
    {
      day: 5,
      from: 'Brianna',
      text: 'danke fürs kommen!! wir hatten das gleiche eis dabei lol. zwillinge',
    },
    {
      day: 5,
      from: 'jess',
      contactId: 'jess',
      text: 'FRIEDENSVERTRAG!!! ich will zur nächsten übernachtungsparty (L)',
    },
    {
      day: 5,
      from: 'dex',
      contactId: 'dex',
      text: 'hab gehört du und brianna seid jetzt zwillinge. cool',
    },
  ],
  commentsOnPlayer: [
    {
      day: 2,
      text: 'omg du bist endlich auf friendspace!!! du bist in meinen top 8. platz 1 natürlich. sags nich jess ;)',
    },
    {
      day: 3,
      text: 'danke fürs zuhören gestern. auf dich is echt verlass. (L)',
    },
    {
      day: 4,
      text: 'brianna is... NETT??? ich bin so verwirrt. ruf mich an *seufz*',
    },
    {
      day: 5,
      text: 'friedensvertrag-freundinnen. so heißt das jetzt. offiziell. du bist trotzdem platz 1 ~*~',
    },
  ],
};
