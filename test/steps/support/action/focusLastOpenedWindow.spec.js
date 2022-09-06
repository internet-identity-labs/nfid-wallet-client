/**
 * @jest-environment jsdom
 */
import focusLastOpenedWindow from "./focusLastOpenedWindow"

describe("focusLastOpenedWindow", () => {
  beforeEach(() => {
    global.browser = {
      getWindowHandles: jest.fn().mockResolvedValue(["one", "two", "three"]),
      switchToWindow: jest.fn(),
    }
  })

  it("should call focusLastOpenedWindow and open last window on the browser", async () => {
    await focusLastOpenedWindow("last", "")

    expect(global.browser.getWindowHandles).toHaveBeenCalledTimes(1)
    expect(global.browser.switchToWindow).toHaveBeenCalledTimes(1)
    expect(global.browser.switchToWindow).toHaveBeenCalledWith("three")
  })

  it("should call focusLastOpenedWindow and open previous window on the browser", async () => {
    await focusLastOpenedWindow("previous", "")

    expect(global.browser.getWindowHandles).toHaveBeenCalledTimes(1)
    expect(global.browser.switchToWindow).toHaveBeenCalledTimes(1)
    expect(global.browser.switchToWindow).toHaveBeenCalledWith("two")
  })
})
