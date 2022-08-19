import { MigrationService } from "@/main/services/migration.service";
import { GraphicsService } from "@/main/services/graphics.service";
import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from "@loopback/testlab";
import mockFs from "mock-fs";
import { ProfileService } from "@/main/services/profile.service";
import fs from "fs";
import { ConfigService } from "@/main/services/config.service";

describe("Migration service", () => {
  let migrationService: MigrationService;
  let mockGraphicsService: StubbedInstanceWithSinonAccessor<GraphicsService>;
  let mockProfileService: StubbedInstanceWithSinonAccessor<ProfileService>;
  let mockConfigService: StubbedInstanceWithSinonAccessor<ConfigService>;

  beforeEach(() => {
    mockGraphicsService = createStubInstance(GraphicsService);
    mockProfileService = createStubInstance(ProfileService);
    mockConfigService = createStubInstance(ConfigService);
    migrationService = new MigrationService(
      mockGraphicsService,
      mockProfileService,
      mockConfigService
    );
  });

  afterEach(mockFs.restore);

  describe("Separating profile from graphics", () => {
    let mockModDirectory: string;
    let mockProfiles: string;
    let mockLauncherDirectory: string;
    let mockGraphicsPresets: string;

    beforeEach(() => {
      mockModDirectory = "/mod/directory";
      mockLauncherDirectory = `${mockModDirectory}/launcher`;
      mockProfiles = `${mockModDirectory}/profiles`;
      mockGraphicsPresets = `${mockLauncherDirectory}/Graphics Presets`;

      mockFs({
        [mockLauncherDirectory]: {
          "namesMO2.json": "mock-content",
        },
        [mockProfiles]: {
          potato: {
            "modlist.txt": "",
            "plugins.txt": "",
            "Skyrim.ini": "",
            "SkyrimPrefs.ini": "",
            "SkyrimCustom.ini": "",
          },
          low: {
            "modlist.txt": "modified-modlist",
            "plugins.txt": "modified-plugins",
            "Skyrim.ini": "",
            "SkyrimPrefs.ini": "",
            "SkyrimCustom.ini": "",
          },
          high: {
            "modlist.txt": "",
            "plugins.txt": "",
            "Skyrim.ini": "",
            "SkyrimPrefs.ini": "",
            "SkyrimCustom.ini": "",
          },
        },
        [`${mockLauncherDirectory}/backup/Graphics Presets`]: {
          potato: {
            "modlist.txt": "",
            "plugins.txt": "",
            "Skyrim.ini": "",
            "SkyrimPrefs.ini": "",
            "SkyrimCustom.ini": "",
          },
          low: {
            "modlist.txt": "",
            "plugins.txt": "",
            "Skyrim.ini": "",
            "SkyrimPrefs.ini": "",
            "SkyrimCustom.ini": "",
          },
          high: {
            "modlist.txt": "",
            "plugins.txt": "",
            "Skyrim.ini": "",
            "SkyrimPrefs.ini": "",
            "SkyrimCustom.ini": "",
          },
        },
      });

      mockProfileService.stubs.getProfileDirectories.resolves([
        `${mockProfiles}/potato`,
        `${mockProfiles}/low`,
        `${mockProfiles}/high`,
      ]);

      mockGraphicsService.stubs.graphicsDirectory.returns(mockGraphicsPresets);

      mockGraphicsService.stubs.extractGraphicsFiles.callThrough();

      mockGraphicsService.stubs.graphicsMappingPath.returns(
        `${mockLauncherDirectory}/namesGraphics.json`
      );

      mockProfileService.stubs.profileMappingFile.returns(
        `${mockLauncherDirectory}/namesMO2.json`
      );
    });

    it("should not do anything if the user already has graphics presets", async () => {
      mockGraphicsService.stubs.graphicsExist.resolves(true);

      mockFs({
        [mockGraphicsPresets]: {
          low: {
            "mock-existing-file": "mock-content",
          },
        },
      });

      await migrationService.separateProfileFromGraphics();

      expect(
        (await fs.promises.readdir(`${mockGraphicsPresets}/low`)).sort()
      ).to.eql(["mock-existing-file"]);
    });

    it("should create the namesGraphics.json", async () => {
      mockGraphicsService.stubs.graphicsExist.resolves(false);
      await migrationService.separateProfileFromGraphics();

      expect(
        fs.existsSync(`${mockLauncherDirectory}/namesGraphics.json`)
      ).to.eql(true);
    });

    it("should create a standard and performance modlist from the files if they haven't been modified", async () => {
      mockGraphicsService.stubs.graphicsExist.resolves(false);
      await migrationService.separateProfileFromGraphics();

      expect(
        (await fs.promises.readdir(`${mockGraphicsPresets}/low`)).sort()
      ).to.eql(["Skyrim.ini", "SkyrimCustom.ini", "SkyrimPrefs.ini"]);

      expect(
        (await fs.promises.readdir(`${mockGraphicsPresets}/potato`)).sort()
      ).to.eql(["Skyrim.ini", "SkyrimCustom.ini", "SkyrimPrefs.ini"]);
    });

    it("should combine profiles if they haven't been modified", async () => {
      mockGraphicsService.stubs.graphicsExist.resolves(false);

      mockProfileService.stubs.isProfileModified.resolves(false);
      mockProfileService.stubs.isProfileModified.withArgs("low").resolves(true);

      mockProfileService.stubs.profileDirectory.returns(mockProfiles);

      await migrationService.separateProfileFromGraphics();

      expect(fs.existsSync(`${mockProfiles}/low - Customised`)).to.eql(true);
      expect(fs.existsSync(`${mockProfiles}/high`)).to.eql(false);
      expect(fs.existsSync(`${mockProfiles}/1_Wildlander-STANDARD`)).to.eql(
        true
      );
    });
  });
});
