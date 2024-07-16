import { RPCMessage, RPCSuccessResponse } from "../../../type"
import { MethodService } from "../method.service"

export abstract class SilentMethodService implements MethodService {
  abstract requiresAuthentication(): boolean

  abstract executeMethod(
    message: MessageEvent<RPCMessage>,
  ): Promise<RPCSuccessResponse>

  abstract getMethod(): string
}
