import {
  REGISTRATION_DISABLED_MESSAGE,
  RegistrationDisabledError,
  registrationGuardService,
} from "./registration-guard.service"

const registrationDisabledBody = JSON.stringify({
  error: "REGISTRATION_DISABLED",
  message: "Registration of new users is permanently blocked.",
})

describe("registrationGuardService.assertRegistrationAllowed", () => {
  it("should throw RegistrationDisabledError with the repo-owned message on a 403 REGISTRATION_DISABLED response", () => {
    // Given: a 403 response whose body carries the registration-disabled code
    // When: the guard is asserted against it
    const assertRegistration = () =>
      registrationGuardService.assertRegistrationAllowed(
        403,
        registrationDisabledBody,
      )

    // Then: it throws the typed error carrying the repo-owned copy
    expect(assertRegistration).toThrow(RegistrationDisabledError)
    expect(assertRegistration).toThrow(REGISTRATION_DISABLED_MESSAGE)
  })

  it("should not throw for a 403 with a different error code", () => {
    // Given: a 403 body with an unrelated error code
    // When / Then: the guard does not throw
    expect(() =>
      registrationGuardService.assertRegistrationAllowed(
        403,
        JSON.stringify({ error: "FORBIDDEN" }),
      ),
    ).not.toThrow()
  })

  it("should not throw for a 403 with a non-JSON body", () => {
    // Given: a 403 body that is not valid JSON
    // When / Then: parsing fails safely and the guard does not throw
    expect(() =>
      registrationGuardService.assertRegistrationAllowed(403, "forbidden"),
    ).not.toThrow()
  })

  it("should not throw for a non-403 status even with the matching error code", () => {
    // Given: the registration-disabled code but a non-403 status
    // When / Then: only a 403 counts as a registration block
    expect(() =>
      registrationGuardService.assertRegistrationAllowed(
        429,
        registrationDisabledBody,
      ),
    ).not.toThrow()
  })
})
