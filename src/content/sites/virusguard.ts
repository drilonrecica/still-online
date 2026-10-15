// virusguard.example: the scareware joke behind the "subscription has expired!" balloon (P1-04).
// It's an obvious parody: it scans nothing, sells nothing, and says so in the fine print.
export const VIRUSGUARD_HOST = 'virusguard.example';

export const VIRUSGUARD_TEXT = {
  brand: 'VirusGuard 2007',
  slogan: 'Protecting Your Computer Since Earlier This Year',
  alert: 'WARNING!!! YOUR COMPUTER IS 87% INFECTED!!!',
  subAlert:
    'Our FREE online scan has detected SERIOUS problems. (We scan everyone. Everyone is 87%.)',
  scanTitle: 'Scan results',
  scanning: 'Scanning your computer… 100% complete (it was very fast)',
  offer: 'Buy VirusGuard 2007 for only $49.95',
  offerNote: 'Was $49.95. Now $49.95! SAVE $0.00!',
  buy: 'BUY NOW!!!',
  bought: 'Payment system under construction. Please try again never.',
  rescan: 'Scan again',
  rescanned: 'Rescan complete. Still 87%. It is always 87%.',
  testimonialsTitle: 'What our customers say',
  seals: ['100% Certified', 'Totally Secure', 'Award Winning*'],
  fineprint:
    'This is a joke website. VirusGuard 2007 does not exist, did not scan anything and cannot sell you anything. Your computer is fine. *The award was from our cousin.',
} as const;

export interface Threat {
  name: string;
  location: string;
  risk: 'HIGH' | 'VERY HIGH' | 'EXTREME' | 'meh';
}

export const VIRUSGUARD_THREATS: readonly Threat[] = [
  {
    name: 'Trojan.DancingHamster.B',
    location: 'tinfoilcomets.example',
    risk: 'EXTREME',
  },
  {
    name: 'Worm.Glitter.Overload',
    location: 'spaceport.example',
    risk: 'VERY HIGH',
  },
  {
    name: 'Adware.SearchlyToolbar (3% installed)',
    location: 'My Documents',
    risk: 'HIGH',
  },
  {
    name: 'Spyware.Gossip.OMG',
    location: 'celebgossip07.example',
    risk: 'HIGH',
  },
  {
    name: 'Joke.ChainLetter.FWD.FWD.FWD',
    location: 'Inbox',
    risk: 'VERY HIGH',
  },
  { name: 'Tracking.Cookie.Oatmeal', location: 'Kitchen', risk: 'meh' },
];

export const VIRUSGUARD_TESTIMONIALS: readonly {
  quote: string;
  who: string;
}[] = [
  {
    quote: 'I bought VirusGuard and now my computer is 87% infected!',
    who: 'A. Customer',
  },
  {
    quote: 'It found a virus on my toaster. I do not own a computer.',
    who: 'Gerald, 71',
  },
  { quote: 'Best $49.95 I almost spent.', who: 'xXdj_kevXx' },
];
