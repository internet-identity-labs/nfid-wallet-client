import { Agent, HttpAgent } from "@dfinity/agent"
import { storageWithTtl } from "@nfid/client-db"
import { type _SERVICE as ConsentMessageCanister } from "../idl/consent"
import { idlFactory as ConsentMessageCanisterIDL } from "../idl/consent_idl"
import { actorService } from "./actor.service"

const TRUSTED_ORIGINS_CACHE_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000 // 1 day

class TargetValidationError extends Error {
  constructor(error: string, public report: VerificationReport) {
    super(error)
  }
}

export type VerificationReport = {
  isPublicAccountAvailable: boolean,
  details?: {
    icrc28Verified?: boolean,
    icrc1LedgersExcluded?: boolean,
    icrc7LedgersExcluded?: boolean,
    extLedgersExcluded?: boolean
  }
}

class TargetService {
  public async getVerificationReport(targets: string[], origin: string): Promise<VerificationReport> {
    try {
      if (!targets || targets.length === 0) {
        console.error("No targets have been passed")
        return {
          isPublicAccountAvailable: false,
          details: {
            icrc28Verified: false,
            icrc1LedgersExcluded: false,
            icrc7LedgersExcluded: false,
            extLedgersExcluded: false
          }
        }
      }

      const agent: Agent = HttpAgent.createSync({ host: IC_HOST })
      const promises = targets.map(async (canisterId) => {
        const cacheKey = `trusted_origins_${canisterId}`
        const cache = null
        // const cache = await storageWithTtl.get(cacheKey)

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
            await actor.balance()
            await actor.transfer()
          } catch (e) {
            if (e instanceof Error) {
              const isBalanceFree = (e.message as string).includes("Canister has no query method 'balance'")
              const isTransferFree = (e.message as string).includes("Canister has no update method 'transfer'")

              if (!isBalanceFree && !isTransferFree) {
                throw new TargetValidationError(
                  `The canister ${canisterId} has balance or transfer method, which could mean it's EXT ledger.`,
                  {
                    isPublicAccountAvailable: false,
                    details: {
                      extLedgersExcluded: false
                    }
                  }
                )
              }
            }
          }

          var icrc10SupportedStandards: { url: string; name: string }[]
          try {
            icrc10SupportedStandards = await actor.icrc10_supported_standards()
          } catch (error) {
            throw new TargetValidationError(
              `Failed to retrieve supported standards from canister ${canisterId} using the 'icrc10_supported_standards' method.`,
              {
                isPublicAccountAvailable: false,
                details: {
                  icrc28Verified: false,
                  icrc1LedgersExcluded: false,
                  icrc7LedgersExcluded: false
                }
              }
            )
          }

          if (!icrc10SupportedStandards.some(standard => "ICRC-28" === standard.name))
            throw new TargetValidationError(
              `The target canister ${canisterId} has no ICRC-28 standards in "icrc10_supported_standards"`,
              {
                isPublicAccountAvailable: false,
                details: {
                  icrc28Verified: false
                }
              }
            )

          if (icrc10SupportedStandards.some(standard => ["ICRC-1", "ICRC-2"].includes(standard.name)))
            throw new TargetValidationError(
              `The target canister ${canisterId} has one of ICRC-1, ICRC-2 standards in "icrc10_supported_standards"`,
              {
                isPublicAccountAvailable: false,
                details: {
                  icrc1LedgersExcluded: false
                }
              }
            )

          if (icrc10SupportedStandards.some(standard => ["ICRC-7", "ICRC-37"].includes(standard.name)))
            throw new TargetValidationError(
              `The target canister ${canisterId} has one of ICRC-7, ICRC-37 standards in "icrc10_supported_standards"`,
              {
                isPublicAccountAvailable: false,
                details: {
                  icrc7LedgersExcluded: false
                }
              }
            )

          const response = await actor.icrc28_trusted_origins()
          trustedOrigins = response.trusted_origins
          storageWithTtl.set(
            cacheKey,
            trustedOrigins,
            TRUSTED_ORIGINS_CACHE_EXPIRATION_MILLIS,
          )
        }

        if (!trustedOrigins.includes(origin)) {
          throw new TargetValidationError(
            `The target canister ${canisterId} has no the trusted origin: ${origin}`,
            {
              isPublicAccountAvailable: false,
              details: {
                icrc28Verified: false
              }
            }
          )
        }
      })

      await Promise.all(promises)
      return {
        isPublicAccountAvailable: true,
        details: {
          icrc28Verified: true,
          icrc1LedgersExcluded: true,
          icrc7LedgersExcluded: true,
          extLedgersExcluded: true
        }
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
          icrc1LedgersExcluded: false,
          icrc7LedgersExcluded: false,
          extLedgersExcluded: false
        }
      }
    }
  }
}

export const targetService = new TargetService()