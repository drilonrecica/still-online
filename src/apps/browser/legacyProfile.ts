// v0.4 saved Friendspace's default headline, mood and "About me" with the profile, so a girl's
// English defaults stayed after a switch to German or to boy. `sanitizeProfile` drops a saved
// text equal to any of these (girl/boy × en/de, as shipped in v0.4) so it resolves at render.
// Frozen here rather than read from content: German loads lazily, after the store rehydrates.

export const V04_PROFILE_DEFAULTS = {
  headline: [
    'new 2 Friendspace!! ~*sparkle*~ <3',
    'new to Friendspace. skate all day',
    'neu auf Friendspace!! ~*glitzer*~ <3',
    'neu auf Friendspace. skaten bis zum umfallen',
  ],
  mood: [
    { text: 'giggly', emoticon: ':D' },
    { text: 'pumped', emoticon: '(8)' },
    { text: 'kicherig', emoticon: ':D' },
    { text: 'voll motiviert', emoticon: '(8)' },
  ],
  aboutMe: [
    'Hi!! <3 I just joined Friendspace. Click "Edit Profile" to tell the galaxy about yourself.',
    'Hey. I just joined Friendspace. Click "Edit Profile" to tell the galaxy about yourself.',
    'Hi!! <3 Ich bin neu auf Friendspace. Klick auf „Profil bearbeiten“ und erzähl der Galaxis von dir.',
    'Hey. Ich bin neu auf Friendspace. Klick auf „Profil bearbeiten“ und erzähl der Galaxis von dir.',
  ],
} as const;

export const isV04DefaultHeadline = (s: string): boolean =>
  V04_PROFILE_DEFAULTS.headline.some((d) => d === s);

export const isV04DefaultMood = (m: {
  text: string;
  emoticon: string;
}): boolean =>
  V04_PROFILE_DEFAULTS.mood.some(
    (d) => d.text === m.text && d.emoticon === m.emoticon,
  );

export const isV04DefaultAboutMe = (s: string): boolean =>
  V04_PROFILE_DEFAULTS.aboutMe.some((d) => d === s);
