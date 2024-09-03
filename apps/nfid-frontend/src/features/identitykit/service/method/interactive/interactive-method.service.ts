import { RPCMessage, RPCSuccessResponse } from "../../../type"
import { NotSupportedError } from "../../exception-handler.service"
import { MethodService } from "../method.service"

export interface ComponentData {
  method: string
  origin: string
}

export abstract class InteractiveMethodService implements MethodService {
  public async invokeAndGetComponentData(
    message: MessageEvent<RPCMessage>,
  ): Promise<ComponentData | undefined> {
    const componentData = this.getComponentData(message)
    if (!componentData) {
      throw new NotSupportedError()
    }

    return componentData
  }

  public abstract getMethod(): string
  public abstract requiresAuthentication(): boolean
  public abstract onApprove(
    message: MessageEvent<RPCMessage>,
    data?: unknown,
  ): Promise<RPCSuccessResponse>

  public async getComponentData(
    message: MessageEvent<RPCMessage>,
  ): Promise<ComponentData> {
    return {
      method: message.data.method,
      origin: message.origin,
    }
  }
}
