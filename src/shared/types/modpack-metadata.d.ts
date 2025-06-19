export interface Modpack {
  name: string;
  website: string;
  wiki: string;
  patreon: string;
  roadmap: string;
}

export interface FriendlyDirectoryMap {
  real: string;
  friendly: string;
  hidden?: boolean;
}
