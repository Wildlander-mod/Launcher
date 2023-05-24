import mockFs from "mock-fs";
import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from "@loopback/testlab";
import { Resolution } from "@/Resolution";
import { ResolutionService } from "@/main/services/resolution.service";
import { ConfigService, userPreferences } from "@/main/services/config.service";
import { InstructionService } from "@/main/services/instruction.service";
import { beforeEach } from "mocha";
import { DirectoryItems } from "mock-fs/lib/filesystem";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { name as modpackName } from "@/modpack.json";
import { parse } from "js-ini";
import fs from "fs";
import { IIniObjectSection } from "js-ini/src/interfaces/ini-object-section";

describe("Resolution Service", () => {
  let mockConfigService: StubbedInstanceWithSinonAccessor<ConfigService>;
  let mockInstructionService: StubbedInstanceWithSinonAccessor<InstructionService>;
  let resolutionService: ResolutionService;
  const modDirectory = "/mock/modDir";
  // needs to be generated like this as mocking process.cwd() was unsuccessful.
  const fakeAssetDir = `${process.cwd()}/src/assets`;
  const baseFS = {
    [fakeAssetDir]: { "a.json": "{}" },
    [`${modDirectory}/mods/${modpackName}/SKSE/Plugins/`]: {
      "SSEDisplayTweaks.ini": "[Render]\nResolution=3840x1080\n",
    },
  } as DirectoryItems;
  const resUltraWide: Resolution = { width: 3840, height: 1080 };
  const resMedWide: Resolution = { width: 2440, height: 1080 };
  const resNormal: Resolution = { width: 1920, height: 1080 };

  beforeEach(() => {
    mockFs(baseFS);
    mockConfigService = createStubInstance(ConfigService);
    mockInstructionService = createStubInstance(InstructionService);
    resolutionService = new ResolutionService(
      mockConfigService,
      mockInstructionService
    );
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("Should get correct resource path", () => {
    const res = resolutionService.getResourcePath();
    expect(res).to.eql(fakeAssetDir);
  });

  it("Should check if a resolution is UltraWide", () => {
    expect(resolutionService.isUltraWidescreen(resUltraWide)).to.be.true();
    expect(resolutionService.isUltraWidescreen(resNormal)).to.be.false();
  });

  it("Should get correct closest supported ratio", () => {
    expect(resolutionService.getClosestSupportedRatio(resUltraWide)).to.eql(
      "32:9"
    );
    expect(resolutionService.getClosestSupportedRatio(resMedWide)).to.eql(
      "21:9"
    );
    expect(resolutionService.getClosestSupportedRatio(resNormal)).to.eql(
      "16:9"
    );
  });

  // unable to mock {screen} from electron thus skipped
  it.skip("Should set & apply a new resolution correctly", async () => {
    // can't figure out how to mock the userPreference so setting the real one
    userPreferences.set(USER_PREFERENCE_KEYS.RESOLUTION, resNormal);
    // for USER_PREFERENCE_KEYS.MOD_DIRECTORY/mods/${modpackName}/SKSE/Plugins/SSEDisplayTweaks.ini
    mockConfigService.stubs.getPreference.returns(modDirectory);
    // for postSetResolution->getResolutionInstructions
    mockInstructionService.stubs.getInstructions.returns([
      {
        action: "disable-ultra-widescreen",
        type: "resolution-ratio",
      },
      {
        action: "enable-mod",
        type: "enb",
        target: "16:9",
        mod: "target-mod",
      },
    ]);
    mockInstructionService.stubs.execute.resolves(true);

    const res = await resolutionService.setResolution(resNormal);
    expect(res).to.be.true();
    expect(
      mockConfigService.stubs.setPreference.calledWith(
        USER_PREFERENCE_KEYS.RESOLUTION,
        resNormal
      )
    );
    expect(
      mockInstructionService.stubs.execute.calledOnceWithExactly(
        [
          {
            action: "disable-ultra-widescreen",
            type: "resolution-ratio",
          },
        ],
        "16:9"
      )
    );
    const newGraphicSettings = parse(
      fs.readFileSync(resolutionService.skyrimGraphicsSettingsPath(), "utf-8"),
      { comment: "#" }
    ) as IIniObjectSection;
    expect(
      (newGraphicSettings.Render as IIniObjectSection).BorderlessUpscale
    ).to.be.true();
    expect((newGraphicSettings.Render as IIniObjectSection).Resolution).to.eql(
      "1920x1080"
    );
  });
});
