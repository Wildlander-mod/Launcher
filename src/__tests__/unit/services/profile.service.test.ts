import mockFs from "mock-fs";
import { FriendlyDirectoryMap } from "@/modpack-metadata";
import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from "@loopback/testlab";
import { ConfigService } from "@/main/services/config.service";
import { ProfileService } from "@/main/services/profile.service";

describe("Profile service", () => {
  let mockConfigService: StubbedInstanceWithSinonAccessor<ConfigService>;
  let profileService: ProfileService;

  beforeEach(() => {
    mockConfigService = createStubInstance(ConfigService);
    profileService = new ProfileService(mockConfigService);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should get the profiles", async () => {
    const modDirectory = "mod/directory";
    const launcherDirectory = `${modDirectory}/launcher`;

    mockConfigService.stubs.modDirectory.returns(modDirectory);
    mockConfigService.stubs.launcherDirectory.returns(launcherDirectory);

    mockFs({
      [`${launcherDirectory}/namesMO2.json`]: JSON.stringify([
        {
          real: "mock-real-name",
          friendly: "mock friendly name",
        },
      ] as FriendlyDirectoryMap[]),
      [`${modDirectory}/profiles/unmapped`]: {},
    });

    const profiles = await profileService.getProfiles();
    const expected: FriendlyDirectoryMap[] = [
      {
        real: "mock-real-name",
        friendly: "mock friendly name",
      },
      {
        real: "unmapped",
        friendly: "unmapped",
      },
    ];

    expect(profiles).to.eql(expected);
  });

  it("should get the profile's directories", async () => {
    const modDirectory = "mod/directory";
    const launcherDirectory = `${modDirectory}/launcher`;

    mockConfigService.stubs.modDirectory.returns(modDirectory);
    mockConfigService.stubs.launcherDirectory.returns(launcherDirectory);

    mockFs({
      [`${launcherDirectory}/namesMO2.json`]: JSON.stringify([
        {
          real: "mock-real-name",
          friendly: "mock friendly name",
        },
      ] as FriendlyDirectoryMap[]),
      [`${modDirectory}/profiles/unmapped`]: {},
      [`${modDirectory}/profiles/mock-real-name`]: {},
    });

    const profileDirectories = await profileService.getProfileDirectories();
    const expected = [
      `${modDirectory}/profiles/mock-real-name`,
      `${modDirectory}/profiles/unmapped`,
    ];

    expect(profileDirectories).to.eql(expected);
  });

  it("should prepend the profile directory", () => {
    const modDirectory = "mod/directory";

    mockConfigService.stubs.modDirectory.returns(modDirectory);

    expect(profileService.prependProfileDirectory("mock-file.json")).to.eql(
      "mod/directory/profiles/mock-file.json"
    );
  });

  it("should determine if a profile has been modified", async () => {
    const modDirectory = "mod/directory";
    const launcherDirectory = `${modDirectory}/launcher`;

    mockConfigService.stubs.modDirectory.returns(modDirectory);
    mockConfigService.stubs.backupDirectory.returns(
      `${launcherDirectory}/backups`
    );

    mockFs({
      [`${modDirectory}/profiles/`]: {
        low: {
          unmodified: "unmodified",
        },
        high: {
          modified: "modified",
        },
      },
      [`${launcherDirectory}/backups/profiles`]: {
        low: {
          unmodified: "unmodified",
        },
        high: {
          modified: "original",
        },
      },
    });

    mockConfigService.stubs.backupsExist.returns(false);
    expect(await profileService.isProfileModified("low")).to.eql(false);

    mockConfigService.stubs.backupsExist.returns(true);

    expect(await profileService.isProfileModified("low")).to.eql(false);
    expect(await profileService.isProfileModified("high")).to.eql(true);
  });
});
