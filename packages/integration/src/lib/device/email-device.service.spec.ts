import {
  AccessPointResponse,
  AccountResponse,
  DeviceType,
} from "../_ic_api/identity_manager.d"
import { im } from "../actors"
import { reauthenticationService } from "../authentication/reauthentication.service"
import { emailDeviceService } from "./email-device.service"
import { EmailDeviceNotFoundError } from "./error/email-device-not-found.error"
import { NoSpareAuthMethodError } from "./error/no-spare-auth-method.error"

jest.mock("../authentication/reauthentication.service", () => ({
  reauthenticationService: { reauthenticateWithPasskey: jest.fn() },
}))

const reauthenticateWithPasskeyMock =
  reauthenticationService.reauthenticateWithPasskey as jest.Mock

const EMAIL_PRINCIPAL = "email-principal-id"

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

const emailAccessPoint = accessPoint(
  { Email: null },
  { principal_id: EMAIL_PRINCIPAL },
)
const nonLegacyPasskey = accessPoint(
  { Passkey: null },
  { credential_id: ["credential-id"] },
)
const legacyPasskey = accessPoint({ Passkey: null }, { credential_id: [] })
const recoveryPhrase = accessPoint({ Recovery: null })

function mockGetAccount(
  accessPoints: AccessPointResponse[],
  overrides: Partial<{ status_code: number; error: [] | [string] }> = {},
) {
  const account = { access_points: accessPoints } as AccountResponse
  jest.spyOn(im, "get_account").mockResolvedValue({
    data: [account],
    error: overrides.error ?? [],
    status_code: overrides.status_code ?? 200,
  })
}

describe("emailDeviceService", () => {
  beforeEach(() => {
    reauthenticateWithPasskeyMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    reauthenticateWithPasskeyMock.mockReset()
  })

  describe("hasSpareDevices", () => {
    it("should return true with a non-legacy passkey and a recovery phrase", async () => {
      // Given an account with a non-legacy passkey and a recovery phrase
      mockGetAccount([emailAccessPoint, nonLegacyPasskey, recoveryPhrase])

      // When checking for spare devices
      const result = emailDeviceService.hasSpareDevices()

      // Then both backup methods are recognised
      await expect(result).resolves.toBe(true)
    })

    it("should return false when the only passkey is legacy", async () => {
      // Given an account whose sole passkey has an empty credential id
      mockGetAccount([emailAccessPoint, legacyPasskey, recoveryPhrase])

      // When checking for spare devices
      const result = emailDeviceService.hasSpareDevices()

      // Then a legacy passkey does not count as a backup
      await expect(result).resolves.toBe(false)
    })

    it("should return false with a passkey but no recovery phrase", async () => {
      // Given an account with a passkey but no recovery phrase
      mockGetAccount([emailAccessPoint, nonLegacyPasskey])

      // When checking for spare devices
      const result = emailDeviceService.hasSpareDevices()

      // Then a missing recovery phrase fails the rule
      await expect(result).resolves.toBe(false)
    })

    it("should return false with a recovery phrase but no passkey", async () => {
      // Given an account with a recovery phrase but no passkey
      mockGetAccount([emailAccessPoint, recoveryPhrase])

      // When checking for spare devices
      const result = emailDeviceService.hasSpareDevices()

      // Then a missing passkey fails the rule
      await expect(result).resolves.toBe(false)
    })

    it("should return false when neither spare method is present", async () => {
      // Given an account with only the email device
      mockGetAccount([emailAccessPoint])

      // When checking for spare devices
      const result = emailDeviceService.hasSpareDevices()

      // Then neither backup method is present
      await expect(result).resolves.toBe(false)
    })

    it("should throw when im.get_account does not return 200", async () => {
      // Given im.get_account responds with a non-200 status
      mockGetAccount([], { status_code: 500, error: ["boom"] })

      // When checking for spare devices
      const result = emailDeviceService.hasSpareDevices()

      // Then the account fetch failure is surfaced
      await expect(result).rejects.toThrow(
        "emailDeviceService.fetchAccessPoints im.get_account: boom",
      )
    })
  })

  describe("removeEmailDevice", () => {
    it("should re-authenticate with a passkey before removing the email access point", async () => {
      // Given an account with the email device and both backup methods
      mockGetAccount([emailAccessPoint, nonLegacyPasskey, recoveryPhrase])
      const removeAccessPoint = jest
        .spyOn(im, "remove_access_point")
        .mockResolvedValue({ data: [], error: [], status_code: 200 })

      // When removing the email device
      const result = emailDeviceService.removeEmailDevice()

      // Then a passkey re-auth runs first, then the canister is called with the email principal id
      await expect(result).resolves.toBeUndefined()
      expect(reauthenticateWithPasskeyMock).toHaveBeenCalledWith([
        emailAccessPoint,
        nonLegacyPasskey,
        recoveryPhrase,
      ])
      expect(removeAccessPoint).toHaveBeenCalledWith({
        pub_key: EMAIL_PRINCIPAL,
      })
      expect(
        reauthenticateWithPasskeyMock.mock.invocationCallOrder[0],
      ).toBeLessThan(removeAccessPoint.mock.invocationCallOrder[0])
    })

    it("should throw EmailDeviceNotFoundError without re-auth or canister call when there is no email access point", async () => {
      // Given an account without an email device
      mockGetAccount([nonLegacyPasskey])
      const removeAccessPoint = jest.spyOn(im, "remove_access_point")

      // When removing the email device
      const result = emailDeviceService.removeEmailDevice()

      // Then it fails before the passkey re-auth and before touching the canister
      await expect(result).rejects.toBeInstanceOf(EmailDeviceNotFoundError)
      expect(reauthenticateWithPasskeyMock).not.toHaveBeenCalled()
      expect(removeAccessPoint).not.toHaveBeenCalled()
    })

    it("should throw NoSpareAuthMethodError without re-auth or canister call when spare methods are missing", async () => {
      // Given an account with the email device but only a legacy passkey
      mockGetAccount([emailAccessPoint, legacyPasskey, recoveryPhrase])
      const removeAccessPoint = jest.spyOn(im, "remove_access_point")

      // When removing the email device
      const result = emailDeviceService.removeEmailDevice()

      // Then the client guard blocks the removal before the passkey re-auth
      await expect(result).rejects.toBeInstanceOf(NoSpareAuthMethodError)
      expect(reauthenticateWithPasskeyMock).not.toHaveBeenCalled()
      expect(removeAccessPoint).not.toHaveBeenCalled()
    })

    it("should propagate a passkey re-auth failure without calling the canister", async () => {
      // Given the passkey re-auth is cancelled
      mockGetAccount([emailAccessPoint, nonLegacyPasskey, recoveryPhrase])
      reauthenticateWithPasskeyMock.mockRejectedValue(
        new Error("Passkey confirmation cancelled"),
      )
      const removeAccessPoint = jest.spyOn(im, "remove_access_point")

      // When removing the email device
      const result = emailDeviceService.removeEmailDevice()

      // Then the failure surfaces and the canister is never called
      await expect(result).rejects.toThrow("Passkey confirmation cancelled")
      expect(removeAccessPoint).not.toHaveBeenCalled()
    })

    it("should throw when im.remove_access_point does not return 200", async () => {
      // Given the canister rejects the removal with a non-200 status
      mockGetAccount([emailAccessPoint, nonLegacyPasskey, recoveryPhrase])
      jest
        .spyOn(im, "remove_access_point")
        .mockResolvedValue({ data: [], error: ["nope"], status_code: 400 })

      // When removing the email device
      const result = emailDeviceService.removeEmailDevice()

      // Then the canister failure is surfaced
      await expect(result).rejects.toThrow(
        "emailDeviceService.removeEmailDevice im.remove_access_point: nope",
      )
    })
  })
})
