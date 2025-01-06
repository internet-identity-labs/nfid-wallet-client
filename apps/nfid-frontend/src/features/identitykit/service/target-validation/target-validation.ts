import { ActorSubclass } from "@dfinity/agent";
import { type _SERVICE as ConsentMessageCanister } from "../../idl/consent"
import { extTargetValidation } from "./ext-target-validation";
import { standardsTargetValidation } from "./standards-target-validation";
import { originsTargetValidation } from "./origins-target-validation";

export interface TargetValidation {
    validate(actor: ActorSubclass<ConsentMessageCanister>, canisterId: string, origin: string): Promise<void>
}

export const targetValidations: TargetValidation[] = [
    extTargetValidation,
    standardsTargetValidation,
    originsTargetValidation
]