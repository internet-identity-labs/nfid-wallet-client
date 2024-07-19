import { getIdentity } from "./metamask"

const SIGNATURE =
  "0x2abb0d6e433694a9b03bbc7d3d2e9ab713cdfab9f47cb92378ea930a4357e4712277c3a987d950e052f27f12331d8882e8a1c7fdc8886aae34b58189df9488751b"
const SIGNATURE2 =
  "0xccfd9eb0bf034622dd40bfde6e2debfab16f36a2b715444f86a26507131cd06d2d92e12bc6d49a181a8f2a179385e555eb18f05731b71f153e3de4c46936edec1b"

describe.skip("SignIn with Internet Identity", () => {
  jest.setTimeout(10000)

  it("should generate identity based on metamask signature.", async () => {
    const [identity, identity2, identity3] = await Promise.all([
      getIdentity(SIGNATURE),
      getIdentity(SIGNATURE),
      getIdentity(SIGNATURE2),
    ]).then((array) => array.map((x) => x.getPrincipal().toString()))

    expect(identity).toEqual(identity2)
    expect(identity).not.toEqual(identity3)
  })
})
