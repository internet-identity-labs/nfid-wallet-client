import { Agent, HttpAgent } from "@dfinity/agent"

import { type _SERVICE as ConsentMessageCanister } from "../idl/consent"
import { idlFactory as ConsentMessageCanisterIDL } from "../idl/consent_idl"
import { actorService } from "./actor.service"
import { targetValidationServices } from "./target-validation/target-validation.service"

export class TargetValidationError extends Error {
  constructor(error: string, public report: VerificationReport) {
    super(error)
  }
}

export type VerificationReport = {
  isPublicAccountAvailable: boolean
  details?: {
    icrc28Verified?: boolean
    icrc1LedgersExcluded?: boolean
    icrc7LedgersExcluded?: boolean
    extLedgersExcluded?: boolean
  }
}

class TargetService {
  public async getVerificationReport(
    targets: string[],
    origin: string,
  ): Promise<VerificationReport> {
    try {
      if (!targets || targets.length === 0) {
        console.error("No targets have been passed")
        return {
          isPublicAccountAvailable: false,
          details: {
            icrc28Verified: false,
          },
        }
      }

      const agent: Agent = HttpAgent.createSync({ host: IC_HOST })
      const promises = targets.map(async (canisterId) => {
        const actor = actorService.getActor<ConsentMessageCanister>(
          canisterId,
          ConsentMessageCanisterIDL,
          agent,
        )

        try {
          const promises = targetValidationServices.map((x) =>
            x.validate(actor, canisterId, origin),
          )
          await Promise.all(promises)
        } catch (exception) {
          throw exception
        }
      })

      await Promise.all(promises)
      return {
        isPublicAccountAvailable: true,
        details: {
          icrc28Verified: true,
        },
      }
    } catch (e) {
      const text = e instanceof Error ? e.message : "Unknown error"
      console.error("The targets cannot be validated:", text)

      if (e instanceof TargetValidationError) {
        return e.report
      }

      return {
        isPublicAccountAvailable: false,
        details: {
          icrc28Verified: false,
        },
      }
    }
  }
}

export const targetService = new TargetService()
