import { TargetValidationError } from "../target.service";
import { TargetValidation } from "./target-validation";
import { ActorSubclass } from "@dfinity/agent";
import { type _SERVICE as ConsentMessageCanister } from "../../idl/consent"

class ExtTargetValidation implements TargetValidation {

    async validate(actor: ActorSubclass<ConsentMessageCanister>, canisterId: string, origin: string): Promise<void> {
        const result = await Promise.allSettled([
            actor.balance(),
            actor.transfer()
        ])

        const hasNoExtMethods = result[0].status === "rejected"
            && result[0].reason.message.includes("Canister has no query method 'balance'")
            && result[1].status === "rejected"
            && result[1].reason.message.includes("Canister has no update method 'transfer'")

        if (!hasNoExtMethods) {
            throw new TargetValidationError(
                `The canister ${canisterId} has balance or transfer methods, which could mean it's EXT ledger.`,
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

export const extTargetValidation = new ExtTargetValidation()