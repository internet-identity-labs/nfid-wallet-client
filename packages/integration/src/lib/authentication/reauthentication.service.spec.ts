import { Ed25519KeyIdentity } from "@icp-sdk/core/identity"

import { AccessPointResponse, DeviceType } from "../_ic_api/identity_manager.d"
import { PasskeyNotConfirmedError } from "../delete-account/error/passkey-not-confirmed.error"
import { getPasskey } from "../lambda/passkey"
import { authState } from "./auth-state"
import { requestFEDelegationChain } from "./frontend-delegation"
import { reauthenticationService } from "./reauthentication.service"

jest.mock("../lambda/passkey", () => ({ getPasskey: jest.fn() }))
jest.mock("./frontend-delegation", () => ({
  requestFEDelegationChain: jest.fn(),
}))

const getPasskeyMock = getPasskey as jest.Mock
const requestFEDelegationChainMock = requestFEDelegationChain as jest.Mock

function accessPoint(
  deviceType: DeviceType,
  overrides: Partial<AccessPointResponse> = {},
): AccessPointResponse {
  return {
    icon: "",
    device: "",
    browser: "",
    last_used: BigInt(0),
    principal_id: "principal-id",
    credential_id: [],
    device_type: deviceType,
    ...overrides,
  }
}

const nonLegacyPasskey = accessPoint(
  { Passkey: null },
  { credential_id: ["credential-id"] },
)
const legacyPasskey = accessPoint({ Passkey: null }, { credential_id: [] })
const recoveryPhrase = accessPoint({ Recovery: null })

describe("reauthenticationService", () => {
  afterEach(() => {
    jest.restoreAllMocks()
    getPasskeyMock.mockReset()
    requestFEDelegationChainMock.mockReset()
  })

  it("should throw PasskeyNotConfirmedError when there is no non-legacy passkey", async () => {
    // Given access points with only a legacy passkey and a recovery phrase
    const accessPoints = [legacyPasskey, recoveryPhrase]

    // When re-authenticating with a passkey
    const result =
      reauthenticationService.reauthenticateWithPasskey(accessPoints)

    // Then it fails before reaching passkey storage
    await expect(result).rejects.toBeInstanceOf(PasskeyNotConfirmedError)
    expect(getPasskeyMock).not.toHaveBeenCalled()
  })

  it("should swap the active identity to a passkey-backed delegation on success", async () => {
    // Given passkey storage returns a credential and a fresh delegation chain is issued
    getPasskeyMock.mockResolvedValue([
      {
        key: "credential-id",
        data: JSON.stringify({ credentialId: "YWJj", publicKey: "aabb" }),
      },
    ])
    const sessionKey = Ed25519KeyIdentity.generate()
    requestFEDelegationChainMock.mockResolvedValue({ sessionKey, chain: {} })
    const setAuthState = jest.spyOn(authState, "set").mockResolvedValue()

    // When re-authenticating with a passkey
    await reauthenticationService.reauthenticateWithPasskey([
      nonLegacyPasskey,
      recoveryPhrase,
    ])

    // Then the credential is looked up and authState is switched to the passkey delegation
    expect(getPasskeyMock).toHaveBeenCalledWith(["credential-id"])
    expect(setAuthState).toHaveBeenCalledTimes(1)
    expect(setAuthState.mock.calls[0][0]).toMatchObject({
      sessionKey,
      chain: {},
    })
    expect(setAuthState.mock.calls[0][0].delegationIdentity).toBeDefined()
  })
})
