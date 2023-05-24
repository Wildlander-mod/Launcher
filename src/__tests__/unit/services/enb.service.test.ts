import mockFs from "mock-fs";
import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from "@loopback/testlab";
import { EnbService } from "@/main/services/enb.service";
import { ConfigService, userPreferences } from "@/main/services/config.service";
import { USER_PREFERENCE_KEYS } from "@/shared/enums/userPreferenceKeys";
import { InstructionService } from "@/main/services/instruction.service";
import fs from "fs";
import { AdditionalInstructions } from "@/additional-instructions";
import { DirectoryItems } from "mock-fs/lib/filesystem";

describe("ENB Service", () => {
  let enbService: EnbService;
  let configService: StubbedInstanceWithSinonAccessor<ConfigService>;
  let instructionService: StubbedInstanceWithSinonAccessor<InstructionService>;
  const modDir = "/mock/mods";
  const enbPresetDir = `${modDir}/launcher/ENB Presets`;
  const baseFS = {
    [`${modDir}/Stock Game`]: { "exampleB.json": "[]" },
    [`${modDir}/launcher`]: {
      "namesENB.json": JSON.stringify([{ real: "A", friendly: "Letter A" }]),
    },
    [`${enbPresetDir}/A`]: { "example.json": "{}" },
    [`${enbPresetDir}/B`]: { "exampleB.json": "{}" },
  } as DirectoryItems;
  beforeEach(() => {
    configService = createStubInstance(ConfigService);
    instructionService = createStubInstance(InstructionService);
    enbService = new EnbService(configService, instructionService);
    mockFs(baseFS);
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("should override unmapped with mapped ENB presets", async () => {
    // setting the userPref in beforeEach doesn't work for some reason -> undefined
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, modDir);
    expect(await enbService.getENBPresets()).to.eql([
      {
        friendly: "Letter A",
        real: "A",
      },
      {
        friendly: "B",
        real: "B",
      },
      {
        friendly: "No Shaders",
        real: "noEnb",
      },
    ]);
  });

  it("should backup the entire ENB presets directory", async () => {
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, modDir);
    const enbBackupDir = `${modDir}/launcher/_backups`;
    configService.stubs.backupDirectory.returns(enbBackupDir);
    const orig = fs.readdirSync(enbPresetDir);

    await enbService.backupOriginalENBs();
    const backup = fs.readdirSync(`${enbBackupDir}/ENB Presets`);
    expect(orig).eql(backup);
  });

  it("should reset to the correct ENB preset", async () => {
    const instructions = [
      {
        action: "disable-plugin",
        type: "enb",
        target: ["21:9"],
        plugin: "example.esp",
      },
      {
        action: "disable-ultra-widescreen",
        type: "resolution-ratio",
      },
    ] as AdditionalInstructions;
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, modDir);
    userPreferences.set(USER_PREFERENCE_KEYS.ENB_PROFILE, "A");
    userPreferences.set(USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE, "B");
    configService.stubs.getPreference.returns("A");
    configService.stubs.skyrimDirectory.returns(`${modDir}/Stock Game`);
    instructionService.stubs.getInstructions.returns(instructions);
    instructionService.stubs.execute.resolves(true);
    await enbService.resetCurrentEnb(true);
    expect(
      instructionService.stubs.execute.calledOnceWithExactly([instructions[0]])
    );
    expect(
      configService.stubs.setPreference.calledWithExactly(
        USER_PREFERENCE_KEYS.PREVIOUS_ENB_PROFILE,
        "A"
      )
    ).true();
    expect(
      configService.stubs.setPreference.calledWithExactly(
        USER_PREFERENCE_KEYS.ENB_PROFILE,
        "A"
      )
    ).true();
  });
  it("should restore ENB presets and overwrite existing ones", async () => {
    const enbBackupDir = `${modDir}/launcher/_backups`;
    mockFs({
      ...baseFS,
      [`${enbBackupDir}/ENB Presets/Z`]: { "Z.json": "{}" },
      [`${enbBackupDir}/ENB Presets/A`]: {
        "example.json": JSON.stringify({ different: true }),
      },
    });
    userPreferences.set(USER_PREFERENCE_KEYS.MOD_DIRECTORY, modDir);
    userPreferences.set(USER_PREFERENCE_KEYS.ENB_PROFILE, "A");
    configService.stubs.backupDirectory.returns(enbBackupDir);
    configService.stubs.skyrimDirectory.returns(`${modDir}/Stock Game`);
    // right now Z should not exist within the current presets
    expect(fs.readdirSync(enbPresetDir).includes("Z")).false();
    const backup = fs.readdirSync(`${enbBackupDir}/ENB Presets`);
    // verify A/example.json is overwritten
    const presetAPrior = fs
      .readFileSync(`${enbPresetDir}/A/example.json`)
      .toJSON();
    await enbService.restoreENBPresets();
    const presetACurrent = fs
      .readFileSync(`${enbPresetDir}/A/example.json`)
      .toJSON();
    expect(presetAPrior).not.eql(presetACurrent);
    // current Presets should now contain the previously missing Z
    const current = fs.readdirSync(enbPresetDir);
    expect(backup.every((value) => current.includes(value))).true();
  });
});
