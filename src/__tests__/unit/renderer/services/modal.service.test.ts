import {
  ModalService,
  modalOpenedEvent,
} from "../../../../renderer/src/services/modal.service";
import type { EventService } from "../../../../renderer/src/services/service-container";
import type { VueFinalModalProperty } from "vue-final-modal";

describe("ModalService #renderer #service", () => {
  let service: ModalService;
  let mockEventService: jest.Mocked<EventService>;
  let mockVfm: jest.Mocked<VueFinalModalProperty>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventService = {
      all: new Map(),
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };
    mockVfm = {
      dynamicModals: [],
      openedModals: [],
      modals: [],
      get: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      hideAll: jest.fn(),
      toggle: jest.fn(),
    };
    service = new ModalService(mockEventService);
  });

  describe("openModal() — when queue is empty", () => {
    it("should call vfm.show with the modal name", () => {
      service.openModal("my-modal", mockVfm);

      expect(mockVfm.show).toHaveBeenCalledWith("my-modal");
    });

    it("should emit modalOpenedEvent with true", () => {
      service.openModal("my-modal", mockVfm);

      expect(mockEventService.emit).toHaveBeenCalledWith(
        modalOpenedEvent,
        true
      );
    });
  });

  describe("openModal() — when queue is non-empty", () => {
    beforeEach(() => {
      service.openModal("first-modal", mockVfm);
      jest.clearAllMocks();
    });

    it("should not call vfm.show for the second modal", () => {
      service.openModal("second-modal", mockVfm);

      expect(mockVfm.show).not.toHaveBeenCalled();
    });

    it("should not emit modalOpenedEvent for the second modal", () => {
      service.openModal("second-modal", mockVfm);

      expect(mockEventService.emit).not.toHaveBeenCalled();
    });
  });

  describe("closeModal() — when no other modals queued", () => {
    beforeEach(() => {
      service.openModal("my-modal", mockVfm);
      jest.clearAllMocks();
    });

    it("should call vfm.hide with the closed modal name", () => {
      service.closeModal("my-modal", mockVfm);

      expect(mockVfm.hide).toHaveBeenCalledWith("my-modal");
    });

    it("should emit modalOpenedEvent with false", () => {
      service.closeModal("my-modal", mockVfm);

      expect(mockEventService.emit).toHaveBeenCalledWith(
        modalOpenedEvent,
        false
      );
    });

    it("should not call vfm.show after closing", () => {
      service.closeModal("my-modal", mockVfm);

      expect(mockVfm.show).not.toHaveBeenCalled();
    });
  });

  describe("closeModal() — when another modal is queued", () => {
    beforeEach(() => {
      service.openModal("first-modal", mockVfm);
      service.openModal("second-modal", mockVfm);
      jest.clearAllMocks();
    });

    it("should call vfm.show with the next queued modal name", () => {
      service.closeModal("first-modal", mockVfm);

      expect(mockVfm.show).toHaveBeenCalledWith("second-modal");
    });

    it("should emit modalOpenedEvent with true for the next modal", () => {
      service.closeModal("first-modal", mockVfm);

      expect(mockEventService.emit).toHaveBeenCalledWith(
        modalOpenedEvent,
        true
      );
    });
  });
});
