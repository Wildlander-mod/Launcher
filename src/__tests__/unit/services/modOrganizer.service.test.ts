import {
  MO2Names,
  ModOrganizerService,
} from "@/main/services/modOrganizer.service";
import {
  createStubInstance,
  expect,
  StubbedInstanceWithSinonAccessor,
} from "@loopback/testlab";
import { EnbService } from "@/main/services/enb.service";
import { ErrorService } from "@/main/services/error.service";
import { ConfigService } from "@/main/services/config.service";
import { ResolutionService } from "@/main/services/resolution.service";
import { GameService } from "@/main/services/game.service";
import { ProfileService } from "@/main/services/profile.service";
import { SystemService } from "@/main/services/system.service";
import { GraphicsService } from "@/main/services/graphics.service";

describe("ModOrganizer service", () => {
  let mockEnbService: StubbedInstanceWithSinonAccessor<EnbService>;
  let mockErrorService: StubbedInstanceWithSinonAccessor<ErrorService>;
  let mockConfigService: StubbedInstanceWithSinonAccessor<ConfigService>;
  let mockResolutionService: StubbedInstanceWithSinonAccessor<ResolutionService>;
  let mockGameService: StubbedInstanceWithSinonAccessor<GameService>;
  let mockProfileService: StubbedInstanceWithSinonAccessor<ProfileService>;
  let mockSystemService: StubbedInstanceWithSinonAccessor<SystemService>;
  let mockGraphicsService: StubbedInstanceWithSinonAccessor<GraphicsService>;

  let modOrganizerService: ModOrganizerService;

  beforeEach(() => {
    mockEnbService = createStubInstance(EnbService);
    mockErrorService = createStubInstance(ErrorService);
    mockConfigService = createStubInstance(ConfigService);
    mockResolutionService = createStubInstance(ResolutionService);
    mockGameService = createStubInstance(GameService);
    mockProfileService = createStubInstance(ProfileService);
    mockSystemService = createStubInstance(SystemService);
    mockGraphicsService = createStubInstance(GraphicsService);
  });

  it("should determine if Mod Organizer is running", async () => {
    mockSystemService.stubs.isProcessRunning
      .withArgs(MO2Names.MO2EXE)
      .resolves(true);

    modOrganizerService = new ModOrganizerService(
      mockEnbService,
      mockErrorService,
      mockConfigService,
      mockResolutionService,
      mockGameService,
      mockProfileService,
      mockSystemService,
      mockGraphicsService
    );

    expect(await modOrganizerService.isRunning()).to.eql(true);
  });
});
