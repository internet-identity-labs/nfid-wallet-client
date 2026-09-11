import {
  REGISTRATION_DISABLED_MESSAGE,
  RegistrationDisabledError,
} from "../authentication/registration-guard.service"
import { googleSigninV2Service } from "./google-signin-v2.service"

const token = "google-jwt"

describe("googleSigninV2Service.signin", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should throw RegistrationDisabledError on a 403 REGISTRATION_DISABLED response", async () => {
    // Given: the sign-in endpoint reports that registration is disabled
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () =>
        JSON.stringify({
          error: "REGISTRATION_DISABLED",
          message: "Registration of new users is permanently blocked.",
        }),
    })

    // When: a Google sign-in is attempted
    const signin = googleSigninV2Service.signin(token)

    // Then: it rejects with the typed error carrying the repo-owned message
    await expect(signin).rejects.toBeInstanceOf(RegistrationDisabledError)
    await expect(signin).rejects.toThrow(REGISTRATION_DISABLED_MESSAGE)
  })

  it("should throw a plain Error on an unrelated 403 response", async () => {
    // Given: the endpoint returns a 403 that is not a registration block
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => "forbidden",
    })

    // When / Then: it rejects with a generic Error, not RegistrationDisabledError
    await expect(googleSigninV2Service.signin(token)).rejects.toThrow(
      "forbidden",
    )
    await expect(
      googleSigninV2Service.signin(token),
    ).rejects.not.toBeInstanceOf(RegistrationDisabledError)
  })
})
