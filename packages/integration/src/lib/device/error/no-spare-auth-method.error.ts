export class NoSpareAuthMethodError extends Error {
  constructor(
    message = "Email device cannot be removed without a passkey and recovery phrase as backup.",
  ) {
    super(message)
  }
}
