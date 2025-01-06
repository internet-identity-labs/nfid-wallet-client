import { ActorSubclass } from "@dfinity/agent";
import { type _SERVICE as ConsentMessageCanister } from "../../idl/consent"
import { extTargetValidationService } from "./ext-target-validation.service";
import { standardsTargetValidationService } from "./standards-target-validation.service";
import { originsTargetValidationService } from "./origins-target-validation.service";

export interface TargetValidationService {
    validate(actor: ActorSubclass<ConsentMessageCanister>, canisterId: string, origin: string): Promise<void>
}

export const targetValidationServices: TargetValidationService[] = [
    extTargetValidationService,
    standardsTargetValidationService,
    originsTargetValidationService
]