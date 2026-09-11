export const REGISTRATION_DISABLED_ERROR_CODE = "REGISTRATION_DISABLED"

export const REGISTRATION_DISABLED_MESSAGE =
  "Creating a new account with email or Google is no longer available. Existing users can still sign in for now while email and Google sign-in are being phased out."

export class RegistrationDisabledError extends Error {
  constructor(message: string = REGISTRATION_DISABLED_MESSAGE) {
    super(message)
  }
}

class RegistrationGuardService {
  assertRegistrationAllowed(status: number, rawBody: string): void {
    if (this.isRegistrationDisabledResponse(status, rawBody)) {
      throw new RegistrationDisabledError()
    }
  }

  private isRegistrationDisabledResponse(
    status: number,
    rawBody: string,
  ): boolean {
    if (status !== 403) return false

    try {
      const parsed = JSON.parse(rawBody) as { error?: string }
      return parsed?.error === REGISTRATION_DISABLED_ERROR_CODE
    } catch {
      return false
    }
  }
}

export const registrationGuardService = new RegistrationGuardService()
