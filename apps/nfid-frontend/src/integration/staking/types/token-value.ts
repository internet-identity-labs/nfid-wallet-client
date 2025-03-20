export interface TokenValue {
  getTokenValue(): string
  getUSDValue(): string
}

export interface FormattedDate {
  getDate(): string
  getTime(): string
}
