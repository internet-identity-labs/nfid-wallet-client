import { AccountResponse } from "../_ic_api/identity_manager.d"
import { im } from "../actors"
import { DeviceType } from "../identity-manager/access-points"
import { RecoveryProvisioningMode } from "./enum/recovery-provisioning-mode.enum"
import { RecoveryProvisioningError } from "./error/recovery-provisioning.error"
import { recoveryProvisioningService } from "./recovery-provisioning.service"
import { passkeyRecoveryProvisioningStepService } from "./service/passkey-recovery-provisioning-step-service"

describe("recoveryProvisioningService", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    removePublicKeyCredential()
  })

  describe("getPlan", () => {
    it("should return a PASSKEY step when no passkey access point exists and passkey is supported", async () => {
      // Given an account with only a recovery phrase, and a platform authenticator available
      mockGetAccount([DeviceType.Recovery])
      mockPlatformAuthenticatorAvailable(true)

      // When the plan is built
      const plan = await recoveryProvisioningService.getPlan()

      // Then the passkey is the single outstanding step
      expect(plan).toEqual({
        steps: [RecoveryProvisioningMode.PASSKEY],
        isCompleted: false,
      })
    })

    it("should return a RECOVERY_PHRASE step when the passkey is present and no recovery phrase exists", async () => {
      // Given an account that already has a passkey but no recovery phrase
      mockGetAccount([DeviceType.Passkey])
      mockPlatformAuthenticatorAvailable(true)

      // When the plan is built
      const plan = await recoveryProvisioningService.getPlan()

      // Then the recovery phrase is the single outstanding step
      expect(plan).toEqual({
        steps: [RecoveryProvisioningMode.RECOVERY_PHRASE],
        isCompleted: false,
      })
    })

    it("should return a RECOVERY_PHRASE step when the passkey is unsupported and no recovery phrase exists", async () => {
      // Given an account with no recovery devices and no platform authenticator
      mockGetAccount([])
      mockPlatformAuthenticatorAvailable(false)

      // When the plan is built
      const plan = await recoveryProvisioningService.getPlan()

      // Then the passkey is skipped and the recovery phrase is the outstanding step
      expect(plan).toEqual({
        steps: [RecoveryProvisioningMode.RECOVERY_PHRASE],
        isCompleted: false,
      })
    })

    it("should return a completed plan when both recovery devices are present", async () => {
      // Given an account that already has both a passkey and a recovery phrase
      mockGetAccount([DeviceType.Passkey, DeviceType.Recovery])
      mockPlatformAuthenticatorAvailable(true)

      // When the plan is built
      const plan = await recoveryProvisioningService.getPlan()

      // Then nothing is outstanding and the plan is complete
      expect(plan).toEqual({ steps: [], isCompleted: true })
    })

    it("should offer only one step (PASSKEY first by priority) when both are missing", async () => {
      // Given an account with no recovery devices at all and a platform authenticator available
      mockGetAccount([])
      mockPlatformAuthenticatorAvailable(true)

      // When the plan is built
      const plan = await recoveryProvisioningService.getPlan()

      // Then only one step is offered per login, and it is the passkey by priority order
      expect(plan).toEqual({
        steps: [RecoveryProvisioningMode.PASSKEY],
        isCompleted: false,
      })
    })

    it("should throw RecoveryProvisioningError when im.get_account returns no account", async () => {
      // Given the canister returns an empty account list
      jest
        .spyOn(im, "get_account")
        .mockResolvedValue({ data: [] } as Awaited<
          ReturnType<typeof im.get_account>
        >)

      // When the plan is built
      // Then it is surfaced as a RecoveryProvisioningError
      await expect(
        recoveryProvisioningService.getPlan(),
      ).rejects.toBeInstanceOf(RecoveryProvisioningError)
    })

    it("should throw RecoveryProvisioningError when im.get_account rejects", async () => {
      // Given the canister call fails
      jest
        .spyOn(im, "get_account")
        .mockRejectedValue(new Error("canister unreachable"))

      // When the plan is built
      // Then the I/O failure is surfaced as a RecoveryProvisioningError
      await expect(
        recoveryProvisioningService.getPlan(),
      ).rejects.toBeInstanceOf(RecoveryProvisioningError)
    })
  })

  describe("checkAccount", () => {
    it("should return a completed plan when the passkey is now on the account", async () => {
      // Given the account now reports a passkey access point
      mockGetAccount([DeviceType.Passkey])

      // When the pending passkey plan is checked
      const plan = await recoveryProvisioningService.checkAccount({
        steps: [RecoveryProvisioningMode.PASSKEY],
        isCompleted: false,
      })

      // Then the plan is marked complete
      expect(plan).toEqual({ steps: [], isCompleted: true })
    })

    it("should throw RecoveryProvisioningError when the access point is still absent", async () => {
      // Given the account still has no passkey after the add flow
      mockGetAccount([DeviceType.Recovery])

      // When the pending passkey plan is checked
      // Then it throws because the device never landed
      await expect(
        recoveryProvisioningService.checkAccount({
          steps: [RecoveryProvisioningMode.PASSKEY],
          isCompleted: false,
        }),
      ).rejects.toBeInstanceOf(RecoveryProvisioningError)
    })

    it("should throw RecoveryProvisioningError when im.get_account rejects", async () => {
      // Given the canister call fails
      jest
        .spyOn(im, "get_account")
        .mockRejectedValue(new Error("canister unreachable"))

      // When the pending passkey plan is checked
      // Then the I/O failure is surfaced as a RecoveryProvisioningError
      await expect(
        recoveryProvisioningService.checkAccount({
          steps: [RecoveryProvisioningMode.PASSKEY],
          isCompleted: false,
        }),
      ).rejects.toBeInstanceOf(RecoveryProvisioningError)
    })

    it("should return the plan unchanged with no canister call for an already-completed plan", async () => {
      // Given an already-completed plan
      const getAccountSpy = jest.spyOn(im, "get_account")
      const completedPlan = { steps: [], isCompleted: true }

      // When it is checked
      const plan = await recoveryProvisioningService.checkAccount(completedPlan)

      // Then it is returned as-is without hitting the canister
      expect(plan).toBe(completedPlan)
      expect(getAccountSpy).not.toHaveBeenCalled()
    })
  })

  describe("passkeyRecoveryProvisioningStepService.supportsMode", () => {
    it("should return false when window.PublicKeyCredential is undefined", async () => {
      // Given a browser without the WebAuthn PublicKeyCredential API
      removePublicKeyCredential()

      // When passkey support is probed
      // Then the mode is reported as unsupported
      await expect(
        passkeyRecoveryProvisioningStepService.supportsMode(),
      ).resolves.toBe(false)
    })

    it("should return true when a platform authenticator is available", async () => {
      // Given a browser whose platform authenticator reports availability
      mockPlatformAuthenticatorAvailable(true)

      // When passkey support is probed
      // Then the mode is reported as supported
      await expect(
        passkeyRecoveryProvisioningStepService.supportsMode(),
      ).resolves.toBe(true)
    })
  })
})

function mockPlatformAuthenticatorAvailable(isAvailable: boolean): void {
  (
    window as unknown as {
      PublicKeyCredential?: {
        isUserVerifyingPlatformAuthenticatorAvailable: () => Promise<boolean>
      }
    }
  ).PublicKeyCredential = {
    isUserVerifyingPlatformAuthenticatorAvailable: () =>
      Promise.resolve(isAvailable),
  }
}

function removePublicKeyCredential(): void {
  delete (window as unknown as { PublicKeyCredential?: unknown })
    .PublicKeyCredential
}

function buildAccountResponse(deviceTypes: DeviceType[]): AccountResponse {
  return {
    name: [],
    anchor: BigInt(10000),
    access_points: deviceTypes.map((deviceType) => ({
      icon: "",
      device: "",
      browser: "",
      last_used: BigInt(0),
      principal_id: "principal-id",
      credential_id: [],
      device_type:
        deviceType === DeviceType.Passkey
          ? { Passkey: null }
          : { Recovery: null },
    })),
    personas: [],
    is2fa_enabled: false,
    wallet: { NFID: null },
    principal_id: "principal-id",
    phone_number: [],
  } as unknown as AccountResponse
}

function mockGetAccount(deviceTypes: DeviceType[]) {
  return jest
    .spyOn(im, "get_account")
    .mockResolvedValue({ data: [buildAccountResponse(deviceTypes)] } as Awaited<
      ReturnType<typeof im.get_account>
    >)
}
