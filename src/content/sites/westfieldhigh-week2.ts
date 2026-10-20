// westfield-high.example, days 6–10 (bible §5): two news posts a day. Theo's cell drawings on the
// Room 12 wall (day 6), the class rep election (sign-ups 7, the 61–61 tie 9, co-reps 10) and the
// community board's Velvet Lantern listing (day 8), then Mr Dalton's thank-you after the show.
import type { NewsPost } from './types';

export const WESTFIELD_NEWS_WEEK2: readonly NewsPost[] = [
  {
    day: 6,
    title: 'Biology: Cell Drawings on the Art Wall',
    author: 'Mr Dalton',
    body: 'The best cell drawings from the cell project are now on the wall of Room 12, by the door. Congratulations to Theo K., whose drawings are labeled so carefully that I learned two things from them. Please look at them. Please do not poke them. I know. I am the one who pokes things. I am asking anyway.',
  },
  {
    day: 6,
    title: 'Class Representative Elections: Sign-Ups Tomorrow',
    author: 'Dr. Hargrove, Principal',
    body: 'Sign-ups for class representative open tomorrow morning in the Main Office. Candidates may put up posters in the east hallway, twelve each at most. Posters must be smaller than a door. Glitter is permitted but must be swept up by the candidate. The vote will be held in homeroom later this week.',
  },
  {
    day: 7,
    title: 'Class Rep: Meet the Candidates',
    author: 'Dr. Hargrove, Principal',
    body: 'This year we have five candidates for class representative, including Kayla and Brianna, who signed up at the same minute and have asked me not to mention their hair. Posters are up in the east hallway. Speeches will be given in homeroom. Mr Pruitt reminds candidates that the photocopier is not a campaign tool.',
  },
  {
    day: 7,
    title: 'Biology: Leaf Collection Project',
    author: 'Mr Dalton',
    body: 'Biology students: collect 10 different leaves, press them flat and label each one with the name of its tree. The project is due in two weeks. Heavy books work for pressing. The dictionary in the library does not belong to you. Leaves from the potted plant in the Main Office are not allowed. Dr. Hargrove counts them.',
  },
  {
    day: 8,
    title: 'Community Board: Velvet Lantern at the Westfield Rec Hall',
    author: 'Mr Pruitt, Office Manager',
    body: 'Local band Velvet Lantern plays the Westfield Rec Hall on Saturday. Doors open at 6. All ages. Opening act: The Grip Tapes. Mr Dalton has kindly agreed to chaperone. The poster is being drawn by Theo K. and will go up on the office door and at the rec hall this week. Please do not take them.',
  },
  {
    day: 8,
    title: 'Field Trip Permission Slips',
    author: 'Mr Dalton',
    body: 'Biology students will visit the Westfield Nature Center next month. Permission slips went home today and are due back by the end of next week. Please bring a packed lunch, closed shoes and a jacket. The pond has a turtle. We will not be poking the turtle.',
  },
  {
    day: 9,
    title: 'Class Rep Election: A Tie',
    author: 'Dr. Hargrove, Principal',
    body: 'Thank you to every student who voted today. Turnout was excellent. The two leading candidates, Kayla and Brianna, each received 61 votes. One further ballot read "Mystery Loaf" and did not count. Both candidates have met with me and were very polite to each other, mostly. I will announce a decision tomorrow.',
  },
  {
    day: 9,
    title: "Chef's Surprise Loaf Is Not Running for Office",
    author: 'Cafeteria Staff',
    body: "The cafeteria would like to confirm that Chef's Surprise Loaf (formerly Mystery Loaf) was not a candidate in today's election and did not ask for anyone's vote. The loaf does not have opinions. It is a loaf. It will be served on its usual day.",
  },
  {
    day: 10,
    title: 'Class Rep: Co-Representatives Kayla and Brianna',
    author: 'Dr. Hargrove, Principal',
    body: 'After the tie, I am pleased to announce that Kayla and Brianna will serve together as co-representatives for their class this year. They have already agreed on one thing: bangs. I have asked them to agree on a second thing by the end of the month. Congratulations to both, and thank you to every candidate who ran.',
  },
  {
    day: 10,
    title: 'Thank You, Rec Hall',
    author: 'Mr Dalton',
    body: 'Thank you to everyone who came to the Velvet Lantern show tonight and behaved so well. The rec hall fits 80. We counted 83. Nobody was poked. Except the bucket. I poked the bucket. It is a paint bucket. It is also, apparently, a drum. I have been a chaperone for eleven years and this was the first time I was asked for an encore.',
  },
];
