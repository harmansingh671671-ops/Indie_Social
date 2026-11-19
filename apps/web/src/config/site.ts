/**
 * EDIT ME — product identity and navigation.
 * Changing the name here updates the document title, header, and aria labels.
 */
export const siteConfig = {
  name: 'Scroll',
  /** Letter shown inside the red logo badge. */
  logoLetter: 'S',
  tagline: 'Discover the indie web',
  description:
    'A visual discovery feed for strange, playful and beautiful corners of the internet.',

  /**
   * Demo profile used by the Saved and Profile pages.
   * Replace with real auth data when a backend exists.
   */
  currentUser: {
    name: 'Harman Singh',
    handle: 'harman',
    bio: 'Collecting the weird and wonderful corners of the web.',
    location: 'Punjab, India',
    followers: 128,
    following: 64,
  },
} as const;

export const ROUTES = {
  home: '/',
  explore: '/explore',
  search: '/search',
  saved: '/saved',
  profile: '/profile',
} as const;
