import {
  mapPermissionsResponse,
  SUPPORTED_STANDARDS,
} from "frontend/features/identitykit/helpers/scopes"

import { RPCMessage, RPCSuccessResponse, Icrc25Dto } from "../../../type"
import { authService } from "../../auth.service"
import { SilentMethodService } from "./silent-method.service"

export interface PermissionsComponentData {
  permissions: string[]
}

class Icrc25RequestPermissionsMethodService extends SilentMethodService {
  public getMethod(): string {
    return "icrc25_request_permissions"
  }

  public requiresAuthentication(): boolean {
    return false
  }

  public async executeMethod(
    message: MessageEvent<RPCMessage>,
  ): Promise<RPCSuccessResponse> {
    const icrc25Message = message.data.params as unknown as Icrc25Dto
    const permissions = icrc25Message.scopes.map((x) => x.method)
    const filteredPermissions = permissions.filter((x) =>
      SUPPORTED_STANDARDS.includes(x),
    )

    await authService.savePermissions(filteredPermissions)

    const response: RPCSuccessResponse = {
      origin: message.origin,
      jsonrpc: message.data.jsonrpc,
      id: message.data.id,
      result: mapPermissionsResponse(filteredPermissions),
    }

    return response
  }
}

export const icrc25RequestPermissionsMethodService =
  new Icrc25RequestPermissionsMethodService()
