import { ConfigService, UserPreferences } from "@/main/services/config.service";
import { expect } from "@loopback/testlab";
import mockFs from "mock-fs";
import Store from "electron-store";

describe("Config Service", () => {
  let mockStore: Store<UserPreferences>;
  let mockModDirectory: string;

  beforeEach(() => {
    const mockUserConfig = "/mock/config";
    const preferenceFile = "userPreferences";
    mockModDirectory = "mock/mod/directory";
    mockFs({
      [`${mockUserConfig}/${preferenceFile}.json`]: JSON.stringify({
        MOD_DIRECTORY: mockModDirectory,
      }),
    });
    mockStore = new Store<UserPreferences>({
      name: preferenceFile,
      cwd: mockUserConfig,
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should get the mod directory", () => {
    const configService = new ConfigService(mockStore);
    expect(configService.modDirectory()).to.eql("mock/mod/directory");
  });

  it("should return the modlist launcher directory", () => {
    const configService = new ConfigService(mockStore);
    expect(configService.launcherDirectory()).to.eql(
      `${mockModDirectory}/launcher`
    );
  });
});
