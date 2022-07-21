/**
 * @jest-environment jsdom
 */
import { getMultiIdent } from "."
import { DeviceData } from "../_ic_api/internet_identity_types"
import { MultiWebAuthnIdentity } from "../identity/multiWebAuthnIdentity"
import { II_DEVICES_DATA } from "./__mocks"

describe("internet-identity test suite", () => {
  describe("getMultiIdent test suite", () => {
    it("should create MultiWebAuthnIdentity", () => {
      MultiWebAuthnIdentity.fromCredentials = jest.fn()
      getMultiIdent(II_DEVICES_DATA as DeviceData[])
      expect(MultiWebAuthnIdentity.fromCredentials).toHaveBeenCalledWith(
        [
          {
            credentialId: Buffer.from(II_DEVICES_DATA[0].credential_id[0]),
            pubkey: new ArrayBuffer(1),
          },
          {
            credentialId: Buffer.from(II_DEVICES_DATA[1].credential_id[0]),
            pubkey: new ArrayBuffer(1),
          },
        ],
        undefined,
      )
    })
  })
})
