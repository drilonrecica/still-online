// Fingerprints of v0.2 seed texts that later changed (G-03 made the girl side girlier, F-02 moved
// names and captions to American spelling). A v0.2 save still holds this text; matching it means
// the player never touched the file.

/** FNV-1a over UTF-16 code units, like the Messenger avatar pattern. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** `fnv1a(name + '\n' + text)` of the v0.2 English seed, by id (a photo's caption for its text). */
const V02_TEXT: Readonly<Record<string, number>> = {
  'seed:poem-do-not-read': 0xe87c819c,
  'seed:top-8-drama': 0x166d2d06,
  'seed:concert-packing-list': 0x50784b51,
  'seed:letter-to-theo-never-send': 0xc2fbf37f,
  'seed:my-rap-lyrics': 0x02b78bad,
  'seed:diary-age-11': 0x263a26fd,
  'seed:homework-maths': 0xdca87c5f,
  'seed:beach-holiday': 0x229a00c0,
};

/** True when `node` still has the name and text v0.2 shipped for its seed. */
export function isV02SeedText(node: {
  id: string;
  name: string;
  text?: string;
  photo?: { caption?: string };
}): boolean {
  const want = V02_TEXT[node.id];
  const body = node.text ?? node.photo?.caption;
  return (
    want !== undefined &&
    body !== undefined &&
    fnv1a(`${node.name}\n${body}`) === want
  );
}
