import { getPasskey, storePasskey } from "./passkey"

describe("Passkey test", () => {
  it("store/get", async function () {
    await storePasskey("testKey", "testData")
    const response = await getPasskey(["testKey"])
    expect(response[0].key).toEqual("testKey")
    expect(response[0].data).toEqual("testData")
  })
})
