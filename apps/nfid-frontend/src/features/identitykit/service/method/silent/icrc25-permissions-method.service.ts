import { mapPermissionsResponse } from "frontend/features/identitykit/helpers/scopes"

import { RPCMessage, RPCSuccessResponse } from "../../../type"
import { authService } from "../../auth.service"
import { SilentMethodService } from "./silent-method.service"

class Icrc25PermissionsMethodService extends SilentMethodService {
  public getMethod(): string {
    return "icrc25_permissions"
  }

  public requiresAuthentication(): boolean {
    return false
  }

  public async executeMethod(
    message: MessageEvent<RPCMessage>,
  ): Promise<RPCSuccessResponse> {
    const permissions = await authService.getPermissions()

    const response: RPCSuccessResponse = {
      origin: message.origin,
      jsonrpc: message.data.jsonrpc,
      id: message.data.id,
      result: mapPermissionsResponse(permissions),
    }

    return response
  }
}

export const icrc25PermissionsMethodService =
  new Icrc25PermissionsMethodService()
