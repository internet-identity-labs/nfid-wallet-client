/**
 * @jest-environment jsdom
 */
import pause from "./pause"

describe("pause", () => {
  beforeEach(() => {
    global.browser = {
      pause: jest.fn(),
    }
  })

  it("should call pause on the browser object", async () => {
    await pause(1000)

    expect(global.browser.pause).toHaveBeenCalledTimes(1)
    expect(global.browser.pause).toHaveBeenCalledWith(1000)
  })
})
