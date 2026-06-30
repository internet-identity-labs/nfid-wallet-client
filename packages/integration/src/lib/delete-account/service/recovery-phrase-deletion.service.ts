import { Principal } from "@icp-sdk/core/principal"
import { DelegationIdentity } from "@icp-sdk/core/identity"

import { AccountResponse } from "../../_ic_api/identity_manager.d"
import {
  fromMnemonicWithoutValidation,
  IC_DERIVATION_PATH,
} from "../../internet-identity/ed25519"
import { requestFEDelegationChain } from "../../authentication/frontend-delegation"
import { authState } from "../../authentication/auth-state"
import { hasOwnProperty } from "../../test-utils"
import { DeletionStepService } from "../dto/deletion-step-service.dto"
import { DeletionMode } from "../enum/deletion-mode.enum"
import { DeletionError } from "../error/deletion.error"
import { Plan } from "../dto/plan.dto"
import { IncorrectSeedPhraseError } from "../error/incorrect-seed-phrase.error"

export const recoveryPhraseDeletionService: DeletionStepService = {
  async isApplicable(account: AccountResponse): Promise<boolean> {
    return !!account.access_points.find((accessPoint) =>
      hasOwnProperty(accessPoint.device_type, "Recovery"),
    )
  },

  async prepare(): Promise<void> {},

  async execute(seedPhrase: string, plan: Plan): Promise<void> {
    try {
      const recoveryAccessPoint = plan.account.access_points.find(
        (accessPoint) => hasOwnProperty(accessPoint.device_type, "Recovery"),
      )
      if (!recoveryAccessPoint)
        throw new IncorrectSeedPhraseError("No recovery phrase registered")

      const seedPhraseTrimmed = seedPhrase.trim()
      const mnemonic = seedPhraseTrimmed.substring(
        seedPhraseTrimmed.indexOf(" ") + 1,
      )

      const identity = await fromMnemonicWithoutValidation(
        mnemonic,
        IC_DERIVATION_PATH,
      )
      const derivedPrincipal = Principal.selfAuthenticating(
        identity.getPublicKey().toDer(),
      ).toText()

      if (derivedPrincipal !== recoveryAccessPoint.principal_id)
        throw new IncorrectSeedPhraseError()

      const { sessionKey, chain } = await requestFEDelegationChain(identity)

      const delegationIdentity = DelegationIdentity.fromDelegation(
        sessionKey,
        chain,
      )

      await authState.set({
        identity,
        delegationIdentity,
        chain,
        sessionKey,
      })
    } catch (error) {
      if (error instanceof IncorrectSeedPhraseError) throw error
      throw new DeletionError(
        DeletionMode.RECOVERY_PHRASE,
        false,
        (error as Error).message,
      )
    }
  },
}
