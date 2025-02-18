import { SwapName } from "../../types/enums"

export abstract class ExchangeError extends Error {
  abstract getDisplayMessage(provider?: SwapName): string
}
