// pixlog.example: "pixlog", the photo-sharing homage (P2-01). Site text and page meta; friend pages
// (`/<contactId>`) are added from the Pixlog profiles with `PROFILE_PAGE`. Profiles, albums and
// surveys live in src/content/pixlog/.
import type { PixlogSkinId } from '../pixlog/types';
import type { SiteMeta } from './types';

export const PIXLOG_HOST = 'pixlog.example';

export const SITE_META: SiteMeta = {
  title: 'pixlog: share your pics',
  description:
    'pixlog is the place for your photos: albums, comments, blogs and surveys. Show your friends what you did this weekend!',
  keywords: [
    'pixlog',
    'photos',
    'pics',
    'albums',
    'friends',
    'blog',
    'surveys',
    'guestbook',
  ],
  pages: {
    '/': {
      title: 'pixlog - share your pics',
      keywords: ['log in', 'sign up', 'shouts'],
    },
    '/album': {
      title: 'pixlog - Photo album',
      keywords: ['album', 'photos', 'comments', 'pics'],
    },
    '/*': { title: 'pixlog - Page not found' },
  },
};

/** A friend's page (`/<contactId>`); `{name}` is the friend's name. */
export const PROFILE_PAGE = {
  title: '{name} on pixlog',
  keywords: ['profile', 'photos', 'albums', 'blog', 'surveys', 'guestbook'],
};

export const PIXLOG_TEXT = {
  logo: 'pixlog',
  tagline: 'share your pics',
  nav: { label: 'pixlog', home: 'home', login: 'log in' },
  splashHeading: 'Your pics. Your friends. Your pixlog.',
  splashText:
    'Upload your photos, comment on your friends’ albums and find out what everybody did this weekend. It’s free!',
  loginButton: 'log in',
  loginHint: 'Your pixlog is waiting for you.',
  feedHeading: 'What your friends are up to',
  feedPlaceholder:
    'Shouts, new albums and blog posts from your friends will show up here soon.',
  tabsLabel: 'Pages of this pixlog',
  tabs: {
    profile: 'Profile',
    photos: 'Photos',
    blog: 'Blog',
    surveys: 'Surveys',
    guestbook: 'Guestbook',
  },
  pictureLabel: 'Picture of {name}',
  skinLabel: 'Skin: {skin}',
  aboutHeading: 'About me',
  latestAlbumsHeading: 'Latest albums',
  noAlbums: 'No albums yet.',
  photosOne: '1 photo',
  photosMany: '{n} photos',
  albumsHeading: 'Photo albums',
  blogHeading: 'Blog',
  noBlog: 'No blog posts yet.',
  surveysHeading: 'Surveys',
  surveyBy: '{name} filled in “{title}”',
  noSurveys: 'No surveys yet.',
  guestbookHeading: 'Guestbook',
  noGuestbook: 'Nobody signed the guestbook yet.',
  guestbookFrom: '{name} wrote {when}:',
  postedWhen: 'posted {when}',
  albumBack: 'Back to the photos of {name}',
  albumBy: 'Album by {name}',
  photoOf: 'Photo {n} of {total}',
  prev: '« Previous',
  next: 'Next »',
  commentsHeading: 'Comments',
  noComments: 'No comments yet.',
  commentFrom: '{name} wrote {when}:',
  notFoundTitle: 'Page not found',
  notFoundText: 'There is nothing on pixlog at this address.',
  backHome: 'Back to pixlog',
  skins: {
    orange: 'Orange',
    ocean: 'Ocean',
    bubblegum: 'Bubblegum',
    lime: 'Lime',
    night: 'Night',
    sunset: 'Sunset',
  } satisfies Record<PixlogSkinId, string>,
  footer: '© 2007 pixlog · share your pics',
};
