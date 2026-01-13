import { ActorSubclass } from "@dfinity/agent"

import { type _SERVICE as ConsentMessageCanister } from "../../idl/consent"
import { TargetValidationError } from "../target.service"

import { TargetValidationService } from "./target-validation.service"

class StandardsTargetValidationService implements TargetValidationService {
  async validate(
    actor: ActorSubclass<ConsentMessageCanister>,
    canisterId: string,
  ): Promise<void> {
    let icrc10SupportedStandards: { url: string; name: string }[]
    try {
      icrc10SupportedStandards = await actor.icrc10_supported_standards()
    } catch (error) {
      console.log("error", error)
      throw new TargetValidationError(
        `Failed to retrieve supported standards from canister ${canisterId} using the 'icrc10_supported_standards' method.`,
        {
          isPublicAccountAvailable: false,
          details: {
            icrc28Verified: false,
            icrc1LedgersExcluded: false,
            icrc7LedgersExcluded: false,
          },
        },
      )
    }

    if (
      !icrc10SupportedStandards.some((standard) => "ICRC-28" === standard.name)
    )
      throw new TargetValidationError(
        `The target canister ${canisterId} has no ICRC-28 standards in "icrc10_supported_standards"`,
        {
          isPublicAccountAvailable: false,
          details: {
            icrc28Verified: false,
          },
        },
      )

    if (
      icrc10SupportedStandards.some((standard) =>
        ["ICRC-1", "ICRC-2"].includes(standard.name),
      )
    )
      throw new TargetValidationError(
        `The target canister ${canisterId} has one of ICRC-1, ICRC-2 standards in "icrc10_supported_standards"`,
        {
          isPublicAccountAvailable: false,
          details: {
            icrc1LedgersExcluded: false,
          },
        },
      )

    if (
      icrc10SupportedStandards.some((standard) =>
        ["ICRC-7", "ICRC-37"].includes(standard.name),
      )
    )
      throw new TargetValidationError(
        `The target canister ${canisterId} has one of ICRC-7, ICRC-37 standards in "icrc10_supported_standards"`,
        {
          isPublicAccountAvailable: false,
          details: {
            icrc7LedgersExcluded: false,
          },
        },
      )
  }
}

export const standardsTargetValidationService =
  new StandardsTargetValidationService()
