import mockFs from "mock-fs";
import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from "@loopback/testlab";
import { ConfigService, UserPreferences } from "@/main/services/config.service";
import { DirectoryItems } from "mock-fs/lib/filesystem";
import { ModpackService } from "@/main/services/modpack.service";
import { MO2Names } from "@/main/services/modOrganizer.service";
import modpack from "@/modpack.json";
import Store from "electron-store";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";

describe("Modpack Service", () => {
  let modpackService: ModpackService;
  let configService: StubbedInstanceWithSinonAccessor<ConfigService>;
  const mockUserConfig = "/mock/config";
  const modDir = "/mock/mods";
  const enbPresetDir = `${modDir}/launcher/ENB Presets`;
  const baseFS = {
    [mockUserConfig]: { "userPreferences.json": "{}" },
    [`${modDir}/Stock Game`]: { "exampleB.json": "[]" },
    [`${modDir}/launcher`]: {
      "namesENB.json": JSON.stringify([{ real: "A", friendly: "Letter A" }]),
    },
    [`${modDir}/${MO2Names.MO2EXE}`]: "binary exe data",
    [`${modDir}/profiles`]: { "example.json": "{}" },
    [`${enbPresetDir}/A`]: { "example.json": "{}" },
    [`${enbPresetDir}/B`]: { "exampleB.json": "{}" },
  } as DirectoryItems;
  beforeEach(() => {
    configService = createStubInstance(ConfigService);
    modpackService = new ModpackService(configService);
    mockFs(baseFS);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("Should verify that modpack path is valid", () => {
    const res = modpackService.checkModpackPathIsValid(modDir);
    expect(res.ok).to.be.true();
    expect(res.missingPaths).to.eql([]);
  });

  it("Should verify current modpack path is valid & config is set", () => {
    const mockStore = new Store<UserPreferences>({
      name: "userPreferences",
      cwd: mockUserConfig,
    });
    mockStore.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, modDir);
    configService.stubs.getPreferences.returns(mockStore);
    configService.stubs.getPreference.returns(modDir);
    expect(modpackService.checkCurrentModpackPathIsValid()).to.be.true();
  });

  it("Should detect missing files in modpack path", () => {
    const baseFSCopy = baseFS;
    delete baseFSCopy[`${modDir}/${MO2Names.MO2EXE}`];
    mockFs.restore();
    mockFs(baseFSCopy);
    const res = modpackService.checkModpackPathIsValid(modDir);
    expect(res.ok).to.be.false();
    expect(res.missingPaths).to.eql([MO2Names.MO2EXE]);
  });

  it("Should return modpack.json", () => {
    expect(modpackService.getModpackMetadata()).to.eql(modpack);
  });

  it("Should delete modpack from configservice' userPreferences", () => {
    modpackService.deleteModpackDirectory();
    expect(
      configService.stubs.deletePreference.calledOnceWithExactly(
        USER_PREFERENCE_KEYS.MOD_DIRECTORY
      )
    ).to.be.true();
  });
});
