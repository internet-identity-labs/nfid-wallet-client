import { RPCMessage, RPCSuccessResponse } from "../../../type"
import { SilentMethodService } from "./silent-method.service"

class Icrc29GetStatusMethodService extends SilentMethodService {
  public getMethod(): string {
    return "icrc29_status"
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
      result: "ready",
    }

    return response
  }
}

export const icrc29GetStatusMethodService = new Icrc29GetStatusMethodService()
