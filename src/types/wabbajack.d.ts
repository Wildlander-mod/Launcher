export interface WabbajackSettingsFile {
  $type: string;

  [key: string]: {
    $type: string;
    Metadata: unknown;
    ModList: {
      $type: string;
      Archives: Array;
      Author: string;
      Description: string;
      Directives: Array;
      GameType: string;
      Image: string;
      ModManager: 0;
      Name: string;
      Readme: string;
      WabbajackVersion: string;
      Website: string;
      Version: string;
      IsNSFW: boolean;
    };
    InstallationPath: string;
    DownloadPath: string;
    WabbajackPath: string;
    InstalledAt: string;
  };
}
