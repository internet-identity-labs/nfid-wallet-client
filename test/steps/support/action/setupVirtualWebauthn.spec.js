/**
 * @jest-environment jsdom
 */
const { addVirtualAuthenticator } = require("./setupVirtualWebauthn")

describe("setupVirtualWebauthn", () => {
  beforeEach(() => {
    global.browser = {
      addVirtualWebAuth: jest.fn(),
    }
  })
  it("should call addVirtualWebAuth", async () => {
    const authenticatorId1 = await addVirtualAuthenticator(global.browser)
    console.debug("setupVirtualWebauthn", { authenticatorId1 })
    expect(global.browser.addVirtualWebAuth).toHaveBeenCalled()
  })
})
