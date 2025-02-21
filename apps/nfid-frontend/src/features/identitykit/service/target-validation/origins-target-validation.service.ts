import { ActorSubclass } from "@dfinity/agent"

import { type _SERVICE as ConsentMessageCanister } from "../../idl/consent"
import { TargetValidationError } from "../target.service"
import { TargetValidationService } from "./target-validation.service"

class OriginsTargetValidationService implements TargetValidationService {
  async validate(
    actor: ActorSubclass<ConsentMessageCanister>,
    canisterId: string,
    origin: string,
  ): Promise<void> {
    const response = await actor.icrc28_trusted_origins()
    const trustedOrigins = response.trusted_origins

    if (!trustedOrigins.includes(origin)) {
      throw new TargetValidationError(
        `The target canister ${canisterId} has no the trusted origin: ${origin}`,
        {
          isPublicAccountAvailable: false,
          details: {
            icrc28Verified: false,
          },
        },
      )
    }
  }
}

export const originsTargetValidationService =
  new OriginsTargetValidationService()
