export class EmailDeviceNotFoundError extends Error {
  constructor(message = "No email device found on this account.") {
    super(message)
  }
}
