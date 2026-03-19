jest.mock("reflect-metadata", () => ({}));
jest.mock("vue", () => ({
  createApp: jest.fn(() => ({
    use: jest.fn().mockReturnThis(),
    mount: jest.fn(),
  })),
}));
jest.mock("@/renderer/src/router", () => ({
  getRouter: jest.fn(() => ({})),
}));
jest.mock("vue-final-modal", () => jest.fn(() => ({})));
jest.mock("vue3-click-away", () => ({}));
jest.mock("@/renderer/src/App.vue", () => ({}));
jest.mock("@/renderer/src/services/service-container", () => ({
  registerServices: jest.fn(() => ({ modpackService: {} })),
}));

describe("index.ts #renderer #entry", () => {
  beforeAll(async () => {
    await import("@/renderer/src/index");
  });

  describe("mouseup event listener", () => {
    // TODO: convert to it.each([3, 4]) once @types/jest is upgraded to a version that supports it.each on TestFunction

    it("should call preventDefault when button 3 is pressed", () => {
      const event = new MouseEvent("mouseup", {
        button: 3,
        bubbles: true,
        cancelable: true,
      });
      jest.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it("should call preventDefault when button 4 is pressed", () => {
      const event = new MouseEvent("mouseup", {
        button: 4,
        bubbles: true,
        cancelable: true,
      });
      jest.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    // TODO: convert to it.each([0, 1, 2]) once @types/jest is upgraded to a version that supports it.each on TestFunction

    it("should not call preventDefault when button 0 is pressed", () => {
      const event = new MouseEvent("mouseup", {
        button: 0,
        bubbles: true,
        cancelable: true,
      });
      jest.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("should not call preventDefault when button 1 is pressed", () => {
      const event = new MouseEvent("mouseup", {
        button: 1,
        bubbles: true,
        cancelable: true,
      });
      jest.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("should not call preventDefault when button 2 is pressed", () => {
      const event = new MouseEvent("mouseup", {
        button: 2,
        bubbles: true,
        cancelable: true,
      });
      jest.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
