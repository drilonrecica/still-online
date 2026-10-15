// Tacki's tips in German. Tacki says „Sie" to the player, like the original assistants did.
import type { Tip } from '../assistant';

export type { Tip, TipAction, TipEvent, TipOption } from '../assistant';
export { IDLE_JOKE_MINUTES } from '../assistant';

export const TIPS: readonly Tip[] = [
  {
    id: 'stapley-intro',
    trigger: { event: 'firstBoot' },
    text: 'Hallo! Ich bin Tacki. Ich halte alles zusammen. Brauchen Sie Hilfe?',
    options: [
      {
        label: 'Gern, was können Sie denn?',
        action: 'dismiss',
        reply: 'Heften. Meistens Papier. Manchmal Gefühle.',
      },
      { label: 'Nein, danke', action: 'dismiss' },
    ],
  },
  {
    id: 'stapley-letter',
    trigger: { event: 'notepadLetter' },
    text: 'Es sieht so aus, als würden Sie einen Brief schreiben. Möchten Sie Hilfe?',
    options: [
      {
        label: 'Hilfe beim Schreiben des Briefes',
        action: 'dismiss',
        reply: 'lol nö',
      },
      { label: 'Brief ohne Hilfe weiterschreiben', action: 'dismiss' },
      { label: 'Diesen Tipp nicht mehr anzeigen', action: 'never' },
    ],
  },
  {
    id: 'stapley-paint',
    trigger: { app: 'paint' },
    text: 'Wussten Sie schon? Sie können Ihr Meisterwerk als Desktophintergrund festlegen!',
    options: [{ label: 'Verstanden', action: 'dismiss' }],
  },
  {
    id: 'stapley-mail',
    trigger: { app: 'mail' },
    text: 'Öffnen Sie niemals Anhänge von Unbekannten. Es sei denn, es steht drin: 6x weiterleiten.',
    options: [{ label: 'Verstanden', action: 'dismiss' }],
  },
  {
    id: 'stapley-mines',
    trigger: { app: 'mines' },
    text: 'Tipp: Die Zahlen sind keine Telefonnummer.',
    options: [{ label: 'Verstanden', action: 'dismiss' }],
  },
  {
    id: 'stapley-fluff',
    trigger: { event: 'newDay' },
    text: 'Klicken Sie auf das Schaf im Infobereich, um Flocke kennenzulernen!',
    options: [{ label: 'Verstanden', action: 'dismiss' }],
  },
];

/** What Tacki says after 3 idle minutes, in rotation. Each joke can be silenced for good. */
export const IDLE_JOKES: readonly Tip[] = [
  'Warum ging der Computer zum Arzt? Er hatte einen Virus. Außerdem war er ein Computer.',
  'Mein Lieblingsordner ist „Eigene Dateien". Der hat die besten Dateien.',
  'Ich habe das Modem um einen Witz gebeten. Es hat 30 Sekunden lang geschrien. Unhöflich, aber treffend.',
  'Wie nennt man einen schlafenden Computer? Eine Schlummertaste mit Monitor.',
  'Es gibt 10 Arten von Menschen: die, die Binärcode verstehen, und die, die ihr Brötchen auf der Tastatur vergessen haben.',
  'Warum war die Maus nervös? Sie hing an einem Katzenkabel.',
  'Eine Diskette geht in eine Bar. Keiner weiß, was drauf ist.',
  'Defragmentieren ist nur Aufräumen mit Extra-Schritten. Und einem Fortschrittsbalken.',
].map((text, i) => ({
  id: `stapley-joke-${i + 1}`,
  trigger: { event: 'idle' },
  text,
  options: [
    { label: 'Ha. OK', action: 'dismiss' },
    { label: 'Diesen Witz nicht mehr', action: 'never' },
  ],
}));
