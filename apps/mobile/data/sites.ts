// Site catalog — real websites confirmed to allow iframe embedding
export type Site = {
  id: string;
  url: string;
  title: string;
  maker: string;
  category: string;
  description: string;
  color: string; // accent color for poster/loading state
};

import sitesJson from './embeddable_sites.json';

const SITES: Site[] = sitesJson as Site[];

export default SITES;
