import { preparePermissionsResponse } from "frontend/features/identitykit/helpers/scopes"

import { RPCMessage, RPCSuccessResponse } from "../../../type"

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
    const response: RPCSuccessResponse = {
      origin: message.origin,
      jsonrpc: message.data.jsonrpc,
      id: message.data.id,
      result: preparePermissionsResponse(),
    }

    return response
  }
}

export const icrc25RequestPermissionsMethodService =
  new Icrc25RequestPermissionsMethodService()
