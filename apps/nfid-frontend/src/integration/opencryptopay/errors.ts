import { OCPNetwork } from "./types"

export class OCPError extends Error {
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "OCPError"
    this.code = code
  }
}

export class OCPInvalidLnurlError extends OCPError {
  constructor(lnurl: string) {
    super(`Invalid LNURL: ${lnurl}`, "INVALID_LNURL")
    this.name = "OCPInvalidLnurlError"
  }
}

export class OCPNetworkError extends OCPError {
  public readonly statusCode?: number

  constructor(url: string, statusCode?: number) {
    super(
      `OCP request failed: ${url} (status: ${statusCode ?? "unknown"})`,
      "NETWORK_ERROR",
    )
    this.name = "OCPNetworkError"
    this.statusCode = statusCode
  }
}

export class OCPInvalidResponseError extends OCPError {
  public readonly response: unknown

  constructor(url: string, response: unknown) {
    super(`Invalid OCP response from: ${url}`, "INVALID_RESPONSE")
    this.name = "OCPInvalidResponseError"
    this.response = response
  }
}

export class OCPQuoteExpiredError extends OCPError {
  constructor(quoteId: string, expiresAt: string) {
    super(`Quote ${quoteId} expired at ${expiresAt}`, "QUOTE_EXPIRED")
    this.name = "OCPQuoteExpiredError"
  }
}

export class OCPAmountOutOfRangeError extends OCPError {
  constructor(amount: number, min: number, max: number) {
    super(
      `Amount ${amount} is outside allowed range [${min}, ${max}]`,
      "AMOUNT_OUT_OF_RANGE",
    )
    this.name = "OCPAmountOutOfRangeError"
  }
}

export class OCPCurrencyNotSupportedError extends OCPError {
  constructor(currency: string, network: OCPNetwork) {
    super(
      `Currency ${currency} on ${network} is not supported`,
      "CURRENCY_NOT_SUPPORTED",
    )
    this.name = "OCPCurrencyNotSupportedError"
  }
}

export class OCPInsufficientBalanceError extends OCPError {
  constructor(required: string, available: string, currency: string) {
    super(
      `Insufficient ${currency} balance: required ${required}, available ${available}`,
      "INSUFFICIENT_BALANCE",
    )
    this.name = "OCPInsufficientBalanceError"
  }
}

export class OCPTransactionSignError extends OCPError {
  public readonly cause: Error

  constructor(network: OCPNetwork, cause: Error) {
    super(
      `Failed to sign transaction on ${network}: ${cause.message}`,
      "TRANSACTION_SIGN_ERROR",
    )
    this.name = "OCPTransactionSignError"
    this.cause = cause
  }
}

export class OCPSubmitError extends OCPError {
  public readonly apiMessage: string

  constructor(quoteId: string, apiMessage: string) {
    super(
      `OCP submit failed for quote ${quoteId}: ${apiMessage}`,
      "SUBMIT_ERROR",
    )
    this.name = "OCPSubmitError"
    this.apiMessage = apiMessage
  }
}

export class OCPSubmitTimeoutError extends OCPError {
  constructor(url: string) {
    super(`OCP submit timed out: ${url}`, "SUBMIT_TIMEOUT")
    this.name = "OCPSubmitTimeoutError"
  }
}
