import mockFs from "mock-fs";
import { WabbajackService } from "@/main/services/wabbajack.service";
import { SystemService } from "@/main/services/system.service";
import { ModpackService } from "@/main/services/modpack.service";
import { createStubInstance, expect, sinon } from "@loopback/testlab";

const mockLocalAppData = "mock/local/app/data";

const getMockV2Wabbajack = () => {
  return {
    [`${mockLocalAppData}/Wabbajack/installed_modlists.json`]: JSON.stringify({
      "mock/install/location/3": {
        ModList: {
          Name: "Wildlander",
          Version: "1.1.9",
        },
        InstallationPath: "mock/install/location/3",
      },
      "mock/install/location/4": {
        ModList: {
          Name: "Wildlander",
          Version: "1.1.10",
        },
        InstallationPath: "mock/install/location/4",
      },
    }),
  };
};

const getMockV3Wabbajack = () => ({
  [`${mockLocalAppData}/Wabbajack/saved_settings`]: {
    "install-settings-asdfghj.json": JSON.stringify({
      InstallLocation: "mock/install/location/1",
      Metadata: {
        title: "Wildlander",
        version: "1.1.9",
      },
    }),
    "install-settings-lkjhgf.json": JSON.stringify({
      InstallLocation: "mock/install/location/2",
      Metadata: {
        title: "Wildlander",
        version: "1.1.10",
      },
    }),
    "another-setting.json": JSON.stringify({
      something: "else",
    }),
  },
});

describe("Wabbajack service", () => {
  let mockSystemService: SystemService;
  let mockModpackService: ModpackService;
  let wabbajackService: WabbajackService;

  beforeEach(() => {
    mockSystemService = createStubInstance(SystemService);

    mockModpackService = createStubInstance(ModpackService);
    sinon.stub(SystemService, "getLocalAppData").returns(mockLocalAppData);

    wabbajackService = new WabbajackService(
      mockSystemService,
      mockModpackService
    );
  });

  afterEach(() => {
    mockFs.restore();
    sinon.restore();
  });

  it("should combine modlist info from wabbajack v2 and v3", async () => {
    mockFs({ ...getMockV2Wabbajack(), ...getMockV3Wabbajack() });

    expect(await wabbajackService.getInstalledModpacks()).to.eql({
      ["mock/install/location/1"]: {
        title: "Wildlander",
        installPath: "mock/install/location/1",
        version: "1.1.9",
      },
      ["mock/install/location/2"]: {
        title: "Wildlander",
        installPath: "mock/install/location/2",
        version: "1.1.10",
      },
      ["mock/install/location/3"]: {
        title: "Wildlander",
        installPath: "mock/install/location/3",
        version: "1.1.9",
      },
      ["mock/install/location/4"]: {
        title: "Wildlander",
        installPath: "mock/install/location/4",
        version: "1.1.10",
      },
    });
  });

  it("should should return v2 modlists if only they are available", async () => {
    mockFs({ ...getMockV2Wabbajack() });

    expect(await wabbajackService.getInstalledModpacks()).to.eql({
      ["mock/install/location/3"]: {
        title: "Wildlander",
        installPath: "mock/install/location/3",
        version: "1.1.9",
      },
      ["mock/install/location/4"]: {
        title: "Wildlander",
        installPath: "mock/install/location/4",
        version: "1.1.10",
      },
    });
  });

  it("should should return v3 modlists if only they are available", async () => {
    mockFs({ ...getMockV3Wabbajack() });

    expect(await wabbajackService.getInstalledModpacks()).to.eql({
      ["mock/install/location/1"]: {
        title: "Wildlander",
        installPath: "mock/install/location/1",
        version: "1.1.9",
      },
      ["mock/install/location/2"]: {
        title: "Wildlander",
        installPath: "mock/install/location/2",
        version: "1.1.10",
      },
    });
  });

  it("should return null if there is no modlists available", async () => {
    mockFs({ [mockLocalAppData]: {} });
    expect(await wabbajackService.getInstalledModpacks()).to.eql(null);
  });

  it("should get all installed modpacks from wabbajack v2", async () => {
    mockFs(getMockV2Wabbajack());

    expect(await wabbajackService.getInstalledModpacksFromWabbajackV2()).to.eql(
      {
        ["mock/install/location/3"]: {
          title: "Wildlander",
          installPath: "mock/install/location/3",
          version: "1.1.9",
        },
        ["mock/install/location/4"]: {
          title: "Wildlander",
          installPath: "mock/install/location/4",
          version: "1.1.10",
        },
      }
    );
  });

  it("should get installed modpacks from wabbajack v3", async () => {
    mockFs(getMockV3Wabbajack());

    expect(await wabbajackService.getInstalledModpacksFromWabbajackV3()).to.eql(
      {
        ["mock/install/location/1"]: {
          title: "Wildlander",
          installPath: "mock/install/location/1",
          version: "1.1.9",
        },
        ["mock/install/location/2"]: {
          title: "Wildlander",
          installPath: "mock/install/location/2",
          version: "1.1.10",
        },
      }
    );
  });
});
