import { Ed25519KeyIdentity, WebAuthnIdentity } from "@dfinity/identity"
import base64url from "base64url"
import { PasskeyConnector } from "src/features/authentication/auth-selection/passkey-flow/services"

import { DeviceType, IPasskeyMetadata } from "@nfid/integration"

describe("Passkey flow", () => {
  jest.setTimeout(80000)
  it("should register NFID with the passkey", async () => {
    const passkeyService = new PasskeyConnector()
    jest
      .spyOn(passkeyService as any, "createNavigatorCredential")
      .mockResolvedValue(
        Promise.resolve({
          authenticatorAttachment: "platform",
          clientExtensionResults: {},
          id: "X_yexK7OVLUq3RIchUp8KFGZnt4",
          rawId: "X_yexK7OVLUq3RIchUp8KFGZnt4",
          response: {
            attestationObject:
              "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViYSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAPv8MAcVTk7MjAtuAgVX170AFF_8nsSuzlS1Kt0SHIVKfChRmZ7epQECAyYgASFYIHMCFeBD5B2ZNr1xtFdYYc-WTfEmtVnXMUBViJ5fKXNNIlgg85RwZ-N-NPyDyzj2JSxHbMCeQx0lUwzU46khrVvMhPE",
            authenticatorData:
              "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAPv8MAcVTk7MjAtuAgVX170AFF_8nsSuzlS1Kt0SHIVKfChRmZ7epQECAyYgASFYIHMCFeBD5B2ZNr1xtFdYYc-WTfEmtVnXMUBViJ5fKXNNIlgg85RwZ-N-NPyDyzj2JSxHbMCeQx0lUwzU46khrVvMhPE",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiUEdsak1DNWhjSEEtIiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDo5MDkwIiwiY3Jvc3NPcmlnaW4iOmZhbHNlLCJvdGhlcl9rZXlzX2Nhbl9iZV9hZGRlZF9oZXJlIjoiZG8gbm90IGNvbXBhcmUgY2xpZW50RGF0YUpTT04gYWdhaW5zdCBhIHRlbXBsYXRlLiBTZWUgaHR0cHM6Ly9nb28uZ2wveWFiUGV4In0",
            publicKey:
              "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEcwIV4EPkHZk2vXG0V1hhz5ZN8Sa1WdcxQFWInl8pc03zlHBn4340_IPLOPYlLEdswJ5DHSVTDNTjqSGtW8yE8Q",
            publicKeyAlgorithm: -7,
            transports: ["hybrid", "internal"],
          },
          type: "public-key",
        } as unknown as PublicKeyCredential),
      )

    const pk = Ed25519KeyIdentity.generate()

    const publickKeyHexString = pk.getPublicKey().toDer().toString()

    console.log("Public key hex string", pk.getPrincipal().toText())

    let exp: { key: string; data: IPasskeyMetadata } = {
      key: "Dst6_Arh95HGTVwUnp5zEtad_Bo",
      data: {
        type: "platform",
        aaguid: "fbfc3007154e4ecc8c0b6e020557d7bd",
        credentialId: base64urlToArrayBuffer("Dst6_Arh95HGTVwUnp5zEtad_Bo"),
        credentialStringId: "Dst6_Arh95HGTVwUnp5zEtad_Bo",
        publicKey: base64urlToArrayBuffer(pk.getPrincipal().toText()),
        transports: ["hybrid", "internal"],
        clientData: {
          type: "webauthn.create",
          challenge: "PGljMC5hcHA-",
          origin: "http://localhost:9090",
          crossOrigin: false,
        },
        created_at: "2025-02-14T10:27:40.595Z",
      } as IPasskeyMetadata,
    }
    jest
      .spyOn(passkeyService as any, "decodePublicKeyCredential")
      .mockReturnValue(exp)
    jest.spyOn(passkeyService as any, "setUpState").mockImplementation(() => {
      console.log("State set up")
    })
    let actual = await passkeyService.registerWithPasskey("mockedId", {
      isMultiDevice: false,
    })
    const identity = WebAuthnIdentity.fromJSON(
      JSON.stringify({
        rawId: Buffer.from(exp.data.credentialId).toString("hex"),
        publicKey: Buffer.from(exp.data.publicKey).toString("hex"),
      }),
    )
    expect(actual.accessPoints.length).toEqual(1)
    expect(actual.accessPoints[0].principalId).toEqual(
      identity.getPrincipal().toText(),
    )
    expect(actual.principalId).not.toEqual(pk.getPrincipal().toText())
    expect(actual.wallet).toEqual("NFID")
    expect(actual.email).toEqual(undefined)
    expect(actual.name).toEqual("mockedId")
    expect(actual.anchor).not.toEqual(0)
    expect(actual.is2fa).toEqual(true)
    expect(actual.accessPoints[0].credentialId).toEqual(
      "Dst6_Arh95HGTVwUnp5zEtad_Bo",
    )
    expect(actual.accessPoints[0].deviceType).toEqual(DeviceType.Passkey)
  })
})

function base64urlToArrayBuffer(base64urlString: string): ArrayBuffer {
  const decoded = base64url.toBuffer(base64urlString)
  return decoded.buffer
}
