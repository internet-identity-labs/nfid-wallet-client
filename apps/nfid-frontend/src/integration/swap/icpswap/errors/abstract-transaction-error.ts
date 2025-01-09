export abstract class ExchangeError extends Error {
  abstract getDisplayMessage(): string
}
