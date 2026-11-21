export type Category = 'Art' | 'Music' | 'Games' | 'Experiments' | 'Worlds' | 'Tools';

export interface Site {
  /** Stable id used in URLs (/engage/:id) and local storage. */
  id: string;
  title: string;
  creator: string;
  creatorHandle: string;
  category: Category;
  description: string;
  url: string;
  /** Accent colour used for fallbacks, tags and detail-page tints. */
  accent: string;
  /** Image width / height. 0.75 is portrait, 1.25 is landscape. */
  ratio: number;
  tags: string[];
  likes: number;
  saves: number;
  featured?: boolean;
  addedDaysAgo: number;
  /**
   * Optional custom poster. When omitted, a live screenshot preview is used.
   * Set this to a local file (e.g. '/posters/patatap.webp') for a permanent image.
   */
  poster?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}
