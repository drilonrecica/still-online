// westfield-high.example: the school's official site, built from a template the district bought in
// 2001 and never touched again. News posts are day-gated (`day <= currentDay`); Mr Dalton's cell
// project notices follow Theo's arc (jello, presentations on day 5's first period, grades on day 5).
import type { NewsPost } from './types';

export const WESTFIELD_HOST = 'westfield-high.example';

export const WESTFIELD_TEXT = {
  name: 'Westfield High School',
  motto: 'Home of the Wildcats',
  welcomeTitle: 'Welcome to the Westfield High School Web Site',
  welcome:
    'Welcome to our school web site! Here you will find news and announcements, staff contact information and the cafeteria menu. Please check back often for updates.',
  principalNote:
    'At Westfield High, every student is a Wildcat, and every Wildcat matters. Please remember to walk, not run, in the east hallway while the floor is being waxed. - Dr. Hargrove, Principal',
  address: '1200 Orchard Lane, Westfield',
  phone: 'Main Office: 555-0142 · Attendance Line: 555-0143',
  footer: 'Copyright 2001-2007 Westfield High School. All rights reserved.',
  credits:
    'Site designed by the Westfield Computer Club (2001). Best viewed with Web Explorer at 800x600.',
  newsIntro: 'School news and announcements, newest first.',
  noNews: 'There are no announcements at this time.',
  staffIntro:
    'To contact a staff member, please email them or leave a message with the Main Office.',
  menuIntro:
    'All lunches include milk (white or chocolate). Menu subject to change.',
} as const;

export const WESTFIELD_NEWS: readonly NewsPost[] = [
  {
    day: 1,
    title: 'Biology: Cell Project Models Due at the End of the Week',
    author: 'Mr Dalton',
    body: 'Biology students (all periods): your cell models and written reports are due at the end of the week. Every organelle must be labeled. Edible models must be covered. Please do not bring live organisms. Partners were assigned in class. If you have not spoken to your partner yet, today is a good day to start.',
  },
  {
    day: 1,
    title: 'Wildcat Bake Sale: Volunteers Needed',
    author: 'Mrs Okafor, PTA',
    body: 'The Wildcat Bake Sale is coming up next week in the front lobby. All proceeds go toward new band uniforms. We need bakers! Sign-up sheets are outside the Main Office. Please label anything containing nuts.',
  },
  {
    day: 2,
    title: 'Reminder: No MP3 Players in Class',
    author: 'Dr. Hargrove, Principal',
    body: 'Effective immediately, MP3 players, portable CD players and "the little one with the clip" are not allowed in class. Teachers will collect devices that are seen or heard. Collected devices may be picked up from the Main Office after the last bell. We are not listening to your music. (Mr Pruitt says some of it is "actually pretty good.")',
  },
  {
    day: 2,
    title: 'Cafeteria: Mystery Loaf Has a New Name',
    author: 'Cafeteria Staff',
    body: 'Following student feedback, "Mystery Loaf" will now be called "Chef\'s Surprise Loaf". The recipe has not changed. Please stop asking what is in it.',
  },
  {
    day: 3,
    title: 'Biology: A Note About Jello',
    author: 'Mr Dalton',
    body: 'A number of students have asked whether a cell model can be made of jello. Yes. Please keep it cold. Please do not bring it on the bus without a lid. Wobbly is acceptable. Cytoplasm is also wobbly. Liquid is not acceptable. If your model melts, bring your labeled poster.',
  },
  {
    day: 3,
    title: 'Bake Sale Update',
    author: 'Mrs Okafor, PTA',
    body: 'Thank you to everyone who signed up! So far we have 14 trays of brownies and nothing else. If you were planning to bring brownies, please consider cookies, muffins or literally anything that is not brownies.',
  },
  {
    day: 4,
    title: 'Biology: Cell Project Presentations Tomorrow, First Period',
    author: 'Mr Dalton',
    body: 'Presentations are tomorrow during first period, in Room 12. Each pair has five minutes. Index cards are allowed. Nerves are normal. Coolers will be accepted at the door. If your cooler smells like fish, please leave it in the hallway.',
  },
  {
    day: 4,
    title: 'Science Fair Sign-Ups Now Open',
    author: 'Mr Dalton',
    body: "Sign-up sheets for the Westfield Science Fair are on the door of Room 12. Projects may be done alone or in pairs. Last year's volcano limit still applies: one volcano per grade.",
  },
  {
    day: 5,
    title: 'Biology: Cell Project Grades Posted',
    author: 'Mr Dalton',
    body: 'Grades for the cell project are posted outside Room 12. Overall, the class did very well. Several models arrived wobbly, frozen or both. All of them were recognizably cells. I learned a great deal about jello this week. Well done, everyone, and thank you to the pairs who worked so well together.',
  },
  {
    day: 5,
    title: 'Bake Sale Results',
    author: 'Mrs Okafor, PTA',
    body: "The Wildcat Bake Sale raised $212.50 for new band uniforms. Thank you! The leftover brownies were donated to the teachers' lounge, where they lasted nine minutes.",
  },
];

export interface StaffMember {
  name: string;
  role: string;
  room: string;
  email: string;
}

export const WESTFIELD_STAFF: readonly StaffMember[] = [
  {
    name: 'Dr. Hargrove',
    role: 'Principal',
    room: 'Main Office',
    email: 'principal@westfield-high.example',
  },
  {
    name: 'Mr Pruitt',
    role: 'Office Manager',
    room: 'Main Office',
    email: 'office@westfield-high.example',
  },
  {
    name: 'Mr Dalton',
    role: 'Biology',
    room: 'Room 12',
    email: 'mr.dalton@westfield-high.example',
  },
  {
    name: 'Mrs Okafor',
    role: 'Mathematics, PTA Liaison',
    room: 'Room 9',
    email: 'mrs.okafor@westfield-high.example',
  },
  {
    name: 'Ms Fennimore',
    role: 'English',
    room: 'Room 4',
    email: 'ms.fennimore@westfield-high.example',
  },
  {
    name: 'Ms Lindqvist',
    role: 'Art',
    room: 'Room 21',
    email: 'ms.lindqvist@westfield-high.example',
  },
  {
    name: 'Mr Ramos',
    role: 'Computer Lab, Computer Club',
    room: 'Room 15',
    email: 'mr.ramos@westfield-high.example',
  },
  {
    name: 'Coach Brickley',
    role: 'Physical Education',
    room: 'Gym',
    email: 'coach.brickley@westfield-high.example',
  },
];

export interface MenuDay {
  day: string;
  main: string;
  side: string;
  note?: string;
}

/** A generic weekly lunch menu (not a story-day calendar, so weekday names are fine here). */
export const WESTFIELD_MENU: readonly MenuDay[] = [
  {
    day: 'Monday',
    main: "Chef's Surprise Loaf",
    side: 'Mashed potatoes',
    note: 'Formerly Mystery Loaf.',
  },
  {
    day: 'Tuesday',
    main: 'Taco Boat',
    side: 'Corn',
    note: 'The boat is a tortilla. It does not float.',
  },
  { day: 'Wednesday', main: 'Rectangle Pizza', side: 'Garden salad' },
  {
    day: 'Thursday',
    main: 'Chicken Nuggets',
    side: 'Green beans',
    note: 'Tater Tots are suspended until further notice.',
  },
  {
    day: 'Friday',
    main: 'Fish Sticks',
    side: 'Tater Tots (pending)',
    note: 'Bring your own ketchup if you are particular about ketchup.',
  },
];
