import { validateDerivationOrigin } from "../../helpers/validate-derivation-origin"
import { IdentityKitRPCMachineContext } from "../../type"
import { GenericError, NotSupportedError } from "../exception-handler.service"
import { utilsService } from "../utils.service"
import { icrc27AccountsMethodService } from "./interactive/icrc27-accounts-method.service"
import { icrc34DelegationMethodService } from "./interactive/icrc34-delegation-method.service"
import { icrc49CallCanisterMethodService } from "./interactive/icrc49-call-canister-method.service"
import { InteractiveMethodService } from "./interactive/interactive-method.service"
import { icrc25PermissionsMethodService } from "./silent/icrc25-permissions-method.service"
import { icrc25RequestPermissionsMethodService } from "./silent/icrc25-request-permissions-method.service"
import { icrc25SupportedStandardsMethodService } from "./silent/icrc25-supported-standards-method.service"
import { icrc29GetStatusMethodService } from "./silent/icrc29-get-status-method.service"
import { SilentMethodService } from "./silent/silent-method.service"

export interface MethodService {
  getMethod(): string
  requiresAuthentication(): boolean
}

export const silentMethodServices: Map<string, SilentMethodService> =
  utilsService.mapByKey(
    (x) => x.getMethod(),
    [
      icrc25RequestPermissionsMethodService,
      icrc25PermissionsMethodService,
      icrc25SupportedStandardsMethodService,
      icrc29GetStatusMethodService,
    ],
  )

export const interactiveMethodServices: Map<string, InteractiveMethodService> =
  utilsService.mapByKey(
    (x) => x.getMethod(),
    [
      icrc27AccountsMethodService,
      icrc34DelegationMethodService,
      icrc49CallCanisterMethodService,
    ],
  )

function getActiveRequest(context?: IdentityKitRPCMachineContext) {
  if (!context) throw new GenericError("RPC context is missing")
  if (!context.activeRequest) throw new GenericError("No active requests")
  return context.activeRequest
}

export const validateRequest = async (
  context?: IdentityKitRPCMachineContext,
) => {
  const activeRequest = getActiveRequest(context)
  if (!activeRequest.data?.method) throw new GenericError("No method")

  if (
    activeRequest.data?.params &&
    "derivationOrigin" in activeRequest.data?.params
  ) {
    const response = await validateDerivationOrigin(
      activeRequest.origin ?? origin,
      String((activeRequest.data.params as any).derivationOrigin),
    )

    if (response.result === "invalid") {
      throw new GenericError("Invalid derivation origin")
    }
  }

  const isSilent = silentMethodServices.has(activeRequest.data.method)
  const service = isSilent
    ? silentMethodServices.get(activeRequest.data.method)
    : interactiveMethodServices.get(activeRequest.data.method)

  if (!service) throw new NotSupportedError()

  return {
    isSilent,
    requiresAuthentication: service?.requiresAuthentication(),
  }
}

export const executeSilentMethod = async (
  context?: IdentityKitRPCMachineContext,
) => {
  const activeRequest = getActiveRequest(context)
  const service = silentMethodServices.get(activeRequest.data.method)
  if (!service) throw new NotSupportedError()
  return service.executeMethod(activeRequest)
}

export const getInteractiveMethodData = async (
  context?: IdentityKitRPCMachineContext,
) => {
  const activeRequest = getActiveRequest(context)
  const service = interactiveMethodServices.get(activeRequest.data.method)
  if (!service) throw new NotSupportedError()
  return service.invokeAndGetComponentData(activeRequest)
}

export const executeInteractiveMethod = async (
  context: IdentityKitRPCMachineContext | undefined,
  event: { type: string; data?: unknown },
) => {
  const activeRequest = getActiveRequest(context)
  const service = interactiveMethodServices.get(activeRequest.data.method)
  if (!service) throw new NotSupportedError()

  return service.onApprove(activeRequest, event.data)
}
