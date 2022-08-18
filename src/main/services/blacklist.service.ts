import { BindingScope, injectable } from "@loopback/context";
import { service } from "@loopback/core";
import { SystemService } from "@/main/services/system.service";

export interface BlacklistedProgram {
  name: string;
  processName: string;
}

@injectable({
  scope: BindingScope.SINGLETON,
})
export class BlacklistService {
  constructor(@service(SystemService) private systemService: SystemService) {}

  getBlacklistedPrograms(): BlacklistedProgram[] {
    return [
      // Webroot and Norton cause issues because the move some modpack files
      {
        name: "WebRoot Antivirus",
        processName: "WRCoreService.x64.exe",
      },
      {
        name: "WebRoot Antivirus",
        processName: "WRCoreService.x86.exe",
      },
      {
        name: "Norton Antivirus",
        processName: "NortonSecurity.exe",
      },
      {
        name: "Norton Antivirus",
        processName: "navapsvc.exe",
      },
    ];
  }

  async blacklistedProcessesRunning() {
    return (
      await Promise.all(
        this.getBlacklistedPrograms().map(async (process) => ({
          ...process,
          running: await this.systemService.isProcessRunning(
            process.processName
          ),
        }))
      )
    ).filter(({ running }) => running);
  }
}
