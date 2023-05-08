import mockFs from "mock-fs";
import { InstructionService } from "@/main/services/instruction.service";
import { AdditionalInstruction } from "@/additional-instructions";
import { ConfigService } from "@/main/services/config.service";
import { ProfileService } from "@/main/services/profile.service";
import { WabbajackService } from "@/main/services/wabbajack.service";
import modpackAdditionalInstructions from "@/additional-instructions.json";
import {
  expect,
  StubbedInstanceWithSinonAccessor,
  createStubInstance,
} from "@loopback/testlab";
import * as os from "os";
import fs from "fs";

describe("Instruction service", () => {
  let instructionService: InstructionService;
  let configService: StubbedInstanceWithSinonAccessor<ConfigService>;
  let wabbajackService: StubbedInstanceWithSinonAccessor<WabbajackService>;
  let profileService: StubbedInstanceWithSinonAccessor<ProfileService>;

  beforeEach(() => {
    configService = createStubInstance(ConfigService);
    wabbajackService = createStubInstance(WabbajackService);
    profileService = createStubInstance(ProfileService);
    instructionService = new InstructionService(
      configService,
      profileService,
      wabbajackService
    );
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should match json imported instructions", () => {
    // not mocked because mock-require doesn't seem to work here for some reason
    expect(instructionService.getInstructions()).to.eql(
      modpackAdditionalInstructions
    );
  });

  it("should ignore or compute instruction based on modpack version", async () => {
    wabbajackService.stubs.getModpackVersion.resolves("1.1.0");
    const instruction = {
      action: "disable-ultra-widescreen",
      version: "1.0.0",
    } as AdditionalInstruction;
    // instruction is skipped if version mismatch -> undefined
    expect(await instructionService.execute([instruction])).undefined();

    // however having the same modpack version will result in a different result
    wabbajackService.stubs.getModpackVersion.resolves("1.0.0");
    expect(await instructionService.execute([instruction])).not.undefined();
  });

  describe("modlist.txt", () => {
    const mockProfilesDir = "/mock/profiles";
    const mockModlistArr = ["+Mod1E", "-Mod2D", "+Mod3E", "-Mod4D"];
    const mockModlistStr = mockModlistArr.join(os.EOL);
    const mockModlistFile = `${mockProfilesDir}/profileA/modlist.txt`;
    beforeEach(async () => {
      // this is a heavily simplified version of the FS compared to the real thing
      // it does not represent how it actually looks whatsoever, only facilitates this test
      mockFs({
        [mockModlistFile]: mockModlistStr,
      });
      profileService.stubs.getPhysicalProfiles.resolves(
        await fs.promises.readdir(mockProfilesDir, { withFileTypes: true })
      );
      profileService.stubs.profileDirectory.returns(mockProfilesDir);
    });

    it("Should not change anything if instruction matches state", async () => {
      const instructionEnabledAlready = {
        action: "enable-mod",
        type: "resolution-ratio",
        target: "21:9",
        mod: "Mod1E",
      } as AdditionalInstruction;
      await instructionService.execute([instructionEnabledAlready], "21:9");
      const currentModlistContent = fs.readFileSync(mockModlistFile).toString();
      expect(currentModlistContent).to.eql(mockModlistStr);
    });
    it("Should enable disabled mod", async () => {
      const instructionEnableDisabled = {
        action: "enable-mod",
        type: "resolution-ratio",
        target: "21:9",
        mod: "Mod2D",
      } as AdditionalInstruction;
      await instructionService.execute([instructionEnableDisabled], "21:9");
      const currentModlistContent = fs.readFileSync(mockModlistFile).toString();
      expect(currentModlistContent.includes("+Mod2D")).true();
    });
    it("Should disable enabled mod", async () => {
      const instructionDisableEnabled = {
        action: "disable-mod",
        type: "resolution-ratio",
        target: "21:9",
        mod: "Mod3E",
      } as AdditionalInstruction;
      await instructionService.execute([instructionDisableEnabled], "21:9");
      const currentModlistContent = fs.readFileSync(mockModlistFile).toString();
      expect(currentModlistContent.includes("-Mod3E")).true();
    });
    it("Should disable on enable instruction if target mismatch", async () => {
      const instructionInverseEnableTargetMismatch = {
        action: "enable-mod",
        type: "resolution-ratio",
        target: "not matching",
        mod: "Mod1E",
      } as AdditionalInstruction;
      await instructionService.execute(
        [instructionInverseEnableTargetMismatch],
        "21:9"
      );
      const currentModlistContent = fs.readFileSync(mockModlistFile).toString();
      expect(currentModlistContent.includes("-Mod1E")).true();
    });
    it("should enable on disable instruction if target mismatch", async () => {
      const instructionInverseDisableTargetMismatch = {
        action: "disable-mod",
        type: "resolution-ratio",
        target: "missing target in call",
        mod: "Mod1E",
      } as AdditionalInstruction;
      await instructionService.execute([
        instructionInverseDisableTargetMismatch,
      ]);
      const currentModlistContent = fs.readFileSync(mockModlistFile).toString();
      expect(currentModlistContent.includes("+Mod1E")).true();
    });
  });

  describe("plugins.txt", () => {
    const mockProfilesDir = "/mock/profiles";
    const mockPluginList = [
      "*Plugin1E.esp",
      "Plugin2D.esp",
      "*Plugin3E.esp",
      "Plugin4D.esp",
    ];
    const mockPlugins = mockPluginList.join(os.EOL);
    const mockPluginsFile = `${mockProfilesDir}/profileA/plugins.txt`;
    beforeEach(async () => {
      mockFs({
        [mockPluginsFile]: mockPlugins,
      });
      profileService.stubs.getPhysicalProfiles.resolves(
        await fs.promises.readdir(mockProfilesDir, { withFileTypes: true })
      );
      profileService.stubs.profileDirectory.returns(mockProfilesDir);
    });
    it("should not change anything if instruction matches state", async () => {
      const instructionEnabledAlready = {
        action: "enable-plugin",
        type: "resolution-ratio",
        target: ["21:9", "32:9"],
        plugin: "Plugin1E.esp",
      } as AdditionalInstruction;
      await instructionService.execute([instructionEnabledAlready], "21:9");
      const currentPluginsContent = fs.readFileSync(mockPluginsFile).toString();
      expect(currentPluginsContent).to.eql(mockPlugins);
    });
    it("should enable disabled", async () => {
      const instructionEnableDisabled = {
        action: "enable-plugin",
        type: "resolution-ratio",
        target: ["21:9", "32:9"],
        plugin: "Plugin2D.esp",
      } as AdditionalInstruction;
      await instructionService.execute([instructionEnableDisabled], "21:9");
      const currentPluginsContent = fs.readFileSync(mockPluginsFile).toString();
      expect(
        currentPluginsContent.split(os.EOL).includes("*Plugin2D.esp")
      ).true();
    });
    it("should disable enabled", async () => {
      const instructionDisableEnabled = {
        action: "disable-plugin",
        type: "enb",
        target: "21:9",
        plugin: "Plugin3E.esp",
      } as AdditionalInstruction;
      await instructionService.execute([instructionDisableEnabled], "21:9");
      const currentPluginsContent = fs.readFileSync(mockPluginsFile).toString();
      expect(
        currentPluginsContent.split(os.EOL).includes("Plugin3E.esp")
      ).true();
    });
    it("should disable on enable instruction if target mismatch", async () => {
      const instructionInverseEnableTargetMismatch = {
        action: "enable-plugin",
        type: "resolution-ratio",
        target: ["21:9", "32:9"],
        plugin: "Plugin1E.esp",
      } as AdditionalInstruction;
      await instructionService.execute(
        [instructionInverseEnableTargetMismatch],
        "enb"
      );
      const currentPluginsContent = fs.readFileSync(mockPluginsFile).toString();
      expect(
        currentPluginsContent.split(os.EOL).includes("Plugin1E.esp")
      ).true();
    });
    it("should enable on disable instruction if target mismatch", async () => {
      const instructionInverseDisableTargetMismatch = {
        action: "disable-plugin",
        type: "enb",
        target: "noEnb",
        plugin: "Plugin1E.esp",
      } as AdditionalInstruction;
      await instructionService.execute([
        instructionInverseDisableTargetMismatch,
      ]);
      const currentPluginsContent = fs.readFileSync(mockPluginsFile).toString();
      expect(
        currentPluginsContent.split(os.EOL).includes("*Plugin1E.esp")
      ).true();
    });
  });
});
