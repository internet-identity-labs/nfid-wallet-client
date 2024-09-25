export class ServiceUnavailableError extends Error {
  constructor() {
    super()
    this.name = "ServiceUnavailableError"
  }
}
