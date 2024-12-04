import { Agent, HttpAgent } from "@dfinity/agent"

import { storageWithTtl } from "@nfid/client-db"

import { type _SERVICE as ConsentMessageCanister } from "../idl/consent"
import { idlFactory as ConsentMessageCanisterIDL } from "../idl/consent_idl"
import { actorService } from "./actor.service"
import { GenericError } from "./exception-handler.service"

const IC_HOSTNAME = "https://ic0.app"

export const targetService = {
  async validateTargets(targets: string[], origin: string) {
    const agent: Agent = HttpAgent.createSync({ host: IC_HOSTNAME })
    const promises = targets.map(async (canisterId) => {
      const cacheKey = `trusted_origins_${canisterId}`
      const cache = await storageWithTtl.get(cacheKey)

      let trustedOrigins
      if (cache !== null) {
        trustedOrigins = cache as string[]
      } else {
        const actor = actorService.getActor<ConsentMessageCanister>(
          canisterId,
          ConsentMessageCanisterIDL,
          agent,
        )

        try {
          const icrc10SupportedStandards =
            await actor.icrc10_supported_standards()

          if (!icrc10SupportedStandards.some(standard => "ICRC-28" === standard.name))
            console.warn(
              `The target canister ${canisterId} has no ICRC-28 standards in "icrc10_supported_standards"`
            )
          if (icrc10SupportedStandards.some(standard => ["ICRC-1", "ICRC-2", "ICRC-7", "ICRC-37"].includes(standard.name)))
            console.warn(
              `The target canister ${canisterId} has one of ICRC-1, ICRC-2, ICRC-7, ICRC-37 standards in "icrc10_supported_standards"`
            )
        } catch (e) {
          console.warn(
            `The target canister ${canisterId} unsuccsesfully tried to retrieve data from "icrc10_supported_standards"`
          )
        }

        const response = await actor.icrc28_trusted_origins()
        trustedOrigins = response.trusted_origins
        storageWithTtl.set(cacheKey, trustedOrigins, 24)
      }

      if (!trustedOrigins.includes(origin)) {
        throw new GenericError(
          `The target canister ${canisterId} has no the trusted origin: ${origin}`,
        )
      }
    })

    await Promise.all(promises)
  },
}
