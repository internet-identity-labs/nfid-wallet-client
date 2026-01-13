import { RPCMessage, RPCSuccessResponse } from "../../../type"

import { SilentMethodService } from "./silent-method.service"

class Icrc25SupportedStandardsMethodService extends SilentMethodService {
  public getMethod(): string {
    return "icrc25_supported_standards"
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
      result: {
        supportedStandards: [
          {
            name: "ICRC-25",
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-25/ICRC-25.md",
          },
          {
            name: "ICRC-27",
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-27/ICRC-27.md",
          },
          {
            name: "ICRC-29",
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-29/ICRC-29.md",
          },
          {
            name: "ICRC-34",
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-34/ICRC-34.md",
          },
          {
            name: "ICRC-49",
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-49/ICRC-49.md",
          },
        ],
      },
    }

    return response
  }
}

export const icrc25SupportedStandardsMethodService =
  new Icrc25SupportedStandardsMethodService()
