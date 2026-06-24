import base64url from "base64url"

import { AccountResponse } from "../../_ic_api/identity_manager.d"
import { getPasskey } from "../../lambda/passkey"
import { hasOwnProperty } from "../../test-utils"
import { DeletionStepService } from "../dto/deletion-step-service.dto"
import { Plan } from "../dto/plan.dto"
import { PasskeyNotConfirmedError } from "../error/passkey-not-confirmed.error"

export const passkeyDeletionService: DeletionStepService = {
  async isApplicable(account: AccountResponse): Promise<boolean> {
    return account.is2fa_enabled ?? false
  },

  async prepare(plan: Plan): Promise<void> {
    try {
      const passkeyAccessPoints = plan.account.access_points.filter(
        (accessPoint) =>
          hasOwnProperty(accessPoint.device_type, "Passkey") &&
          accessPoint.credential_id[0]?.length,
      )

      if (!passkeyAccessPoints?.length)
        throw new PasskeyNotConfirmedError("No passkeys registered")

      const credentialIds = passkeyAccessPoints.map(
        (accessPoint) => accessPoint.credential_id[0]!,
      )
      const passkeys = await getPasskey(credentialIds)

      const allowCredentials = passkeys.map((passkey) => {
        const decoded = JSON.parse(passkey.data)
        return {
          type: "public-key" as const,
          id: base64url.toBuffer(decoded.credentialId).buffer as ArrayBuffer,
          transports: [] as AuthenticatorTransport[],
        }
      })

      const credential = await navigator.credentials.get({
        mediation: "required",
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials,
          userVerification: "preferred",
        },
      })
      if (!credential) throw new PasskeyNotConfirmedError()
    } catch (error) {
      if (error instanceof PasskeyNotConfirmedError) throw error
      throw new PasskeyNotConfirmedError((error as Error).message)
    }
  },

  async execute(): Promise<void> {},
}
