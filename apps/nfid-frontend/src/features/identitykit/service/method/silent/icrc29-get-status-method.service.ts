import { RPCMessage, RPCSuccessResponse } from "../../../type"
import { NoActionError } from "../../exception-handler.service"

import { SilentMethodService } from "./silent-method.service"

class Icrc29GetStatusMethodService extends SilentMethodService {
  private establishedOrigin?: string
  private establishedSource?: MessageEventSource | null

  public getMethod(): string {
    return "icrc29_status"
  }

  public requiresAuthentication(): boolean {
    return false
  }

  public async executeMethod(
    message: MessageEvent<RPCMessage>,
  ): Promise<RPCSuccessResponse> {
    if (!this.establishedOrigin || !this.establishedSource) {
      this.establishedOrigin = message.origin
      this.establishedSource = message.source
    } else if (
      this.establishedOrigin !== message.origin &&
      this.establishedSource !== message.source
    ) {
      throw new NoActionError()
    }

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
