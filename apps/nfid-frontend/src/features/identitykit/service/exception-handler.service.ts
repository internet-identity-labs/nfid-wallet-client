import { RPCErrorResponse, RPCMessage } from "../type"

export class NotSupportedError extends Error {}
export class GenericError extends Error {}
export class NoActionError extends Error { }

class ExceptionHandlerService {
  public handle(error: unknown, message: MessageEvent<RPCMessage>) {
    console.error("ExceptionHandlerService", error)

    if (error instanceof NotSupportedError) {
      return this.postErrorMessage(message, 2000, "Not supported")
    }

    if (error instanceof GenericError) {
      return this.postErrorMessage(
        message,
        1000,
        "Generic error",
        error.message,
      )
    }
  }

  private postErrorMessage(
    message: MessageEvent<RPCMessage>,
    code: number,
    title: string,
    text?: string,
  ) {
    return {
      origin: message.data.origin,
      jsonrpc: message.data.jsonrpc,
      id: message.data.id,
      error: {
        code,
        message: title,
        text,
      },
    } as RPCErrorResponse
  }
}

export const exceptionHandlerService = new ExceptionHandlerService()
