import { IIniObject } from "js-ini/lib/interfaces/ini-object";

export interface ModOrganizerIni extends IIniObject {
  General: object;
  customExecutables: {
    size: number;
    [key: string]: unknown;
  };
  Settings: object;
}
