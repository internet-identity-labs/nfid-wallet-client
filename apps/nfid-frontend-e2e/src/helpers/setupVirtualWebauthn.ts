import assert from "assert"
import { command } from "webdriver"

export function originToRelyingPartyId(origin: string): string {
  return origin.replace(/https?:\/\/([.\w]+).*/, "$1")
}

/**
 * Already implemented in WDIO since 8.x.x version
 *
 * Adds custom commands for webauthn authenticator administration as documented here:
 * https://webdriver.io/docs/customcommands/#add-more-webdriver-commands
 *
 * About Virtual Authenticator:
 * https://www.w3.org/TR/webauthn-2/#virtual-authenticators
 *
 * @param browser browser to add the commands to
 */
export async function addVirtualAuthCommands(
  browser: WebdriverIO.Browser,
): Promise<void> {
  browser.addCommand(
    "addVirtualWebAuth",
    command("POST", "/session/:sessionId/webauthn/authenticator", {
      command: "addVirtualWebAuth",
      description: "add a virtual authenticator",
      ref: "https://www.w3.org/TR/webauthn-2/#sctn-automation-add-virtual-authenticator",
      variables: [],
      parameters: [
        {
          name: "protocol",
          type: "string",
          description: "The protocol the Virtual Authenticator speaks",
          required: false,
        },
        {
          name: "transport",
          type: "string",
          description: "The AuthenticatorTransport simulated",
          required: false,
        },
        {
          name: "hasResidentKey",
          type: "boolean",
          description:
            "If set to true the authenticator will support client-side discoverable credentials",
          required: false,
        },
        {
          name: "hasUserVerification",
          type: "boolean",
          description:
            "If set to true, the authenticator supports user verification.",
          required: false,
        },
        {
          name: "isUserConsenting",
          type: "boolean",
          description:
            "Determines the result of all user consent authorization gestures",
          required: false,
        },
        {
          name: "isUserVerified",
          type: "boolean",
          description:
            "Determines the result of User Verification performed on the Virtual Authenticator",
          required: false,
        },
      ],
    }),
  )

  browser.addCommand(
    "removeVirtualWebAuth",
    command(
      "DELETE",
      "/session/:sessionId/webauthn/authenticator/:authenticatorId",
      {
        command: "removeVirtualWebAuth",
        description: "remove a virtual authenticator",
        ref: "https://www.w3.org/TR/webauthn-2/#sctn-automation-add-virtual-authenticator",
        variables: [
          {
            name: "authenticatorId",
            type: "string",
            description: "The id of the authenticator to remove",
            required: true,
          },
        ],
        parameters: [],
      },
    ),
  )

  // This retrieves previously created credentials, see https://www.w3.org/TR/webauthn-2/#sctn-automation-get-credentials
  browser.addCommand(
    "getWebauthnCredentials",
    command(
      "GET",
      "/session/:sessionId/webauthn/authenticator/:authenticatorId/credentials",
      {
        command: "getWebauthnCredentials",
        description: "retrieves the credentials of a virtual authenticator",
        ref: "https://www.w3.org/TR/webauthn-2/#sctn-automation-get-credentials",
        variables: [
          {
            name: "authenticatorId",
            type: "string",
            description: "The id of the authenticator to retrieve credentials",
            required: true,
          },
        ],
        parameters: [],
      },
    ),
  )

  // This adds a previously created credential, see https://www.w3.org/TR/webauthn-2/#sctn-automation-add-credential
  browser.addCommand(
    "addWebauthnCredential",
    command(
      "POST",
      "/session/:sessionId/webauthn/authenticator/:authenticatorId/credential",
      {
        command: "addWebauthnCredential",
        description: "Adds a credential to a virtual authenticator",
        ref: "https://www.w3.org/TR/webauthn-2/#sctn-automation-add-credential",
        variables: [
          {
            name: "authenticatorId",
            type: "string",
            description: "The id of the authenticator related to credential",
            required: true,
          },
        ],
        parameters: [
          {
            name: "rpId",
            type: "string",
            description: "The relying party ID the credential is scoped to.",
            required: true,
          },
          {
            name: "credentialId",
            type: "string",
            description: "The credential ID encoded using Base64url encoding",
            required: true,
          },
          {
            name: "isResidentCredential",
            type: "boolean",
            description:
              "If set to true, a client-side discoverable credential is created. If set to false, a server-side credential is created instead.",
            required: true,
          },
          {
            name: "privateKey",
            type: "string",
            description:
              "An asymmetric key package containing a single private key per [RFC5958], encoded using Base64url encoding.",
            required: true,
          },
          {
            name: "signCount",
            type: "number",
            description:
              "The initial value for a signature counter associated to the public key credential source.",
            required: true,
          },
          {
            name: "userHandle",
            type: "string",
            description:
              "The userHandle associated to the credential encoded using Base64url encoding.",
            required: false,
          },
          {
            name: "largeBlob",
            type: "string",
            description:
              "The large, per-credential blob associated to the public key credential source, encoded using Base64url encoding.",
            required: false,
          },
        ],
      },
    ),
  )
}

// NOTE: there is also a native webdriverio implementation for this
// https://webdriver.io/docs/api/webdriver/#addvirtualauthenticator
export async function addVirtualAuthenticator(
  browser: WebdriverIO.Browser,
): Promise<string> {
  return await browser.addVirtualWebAuth("ctap2", "usb", true, true, true, true)
}

// NOTE: there is also a native webdriverio implementation for this
// https://webdriver.io/docs/api/webdriver/#removecredential
export async function removeVirtualAuthenticator(
  browser: WebdriverIO.Browser,
  authenticatorId: string,
): Promise<void> {
  return await browser.removeVirtualWebAuth(authenticatorId)
}

// NOTE: there is also a native webdriverio implementation for this
// https://webdriver.io/docs/api/webdriver/#getcredentials
export async function getWebAuthnCredentials(
  browser: WebdriverIO.Browser,
  authenticatorId: string,
): Promise<WebAuthnCredential[]> {
  return await browser.getWebauthnCredentials(authenticatorId)
}

// NOTE: there is also a native webdriverio implementation for this
// https://webdriver.io/docs/api/webdriver/#addcredential
export async function addWebAuthnCredential(
  browser: WebdriverIO.Browser,
  authId: string,
  credential: WebAuthnCredential,
  rpId: string,
): Promise<void> {
  return await browser.addWebauthnCredential(
    authId,
    rpId,
    credential.credentialId,
    credential.isResidentCredential,
    credential.privateKey,
    credential.signCount,
  )
}

/**
 * Set the text of the current prompt
 * @param  {String}   modalText The text to set to the prompt
 */
export const setupVirtualAuthenticator = async () => {
  try {
    return await addVirtualAuthenticator(browser)
  } catch (e) {
    console.debug("setupVirtualWebauthn", { e })
    assert(e, "Could not setup webauthn")
  }
}

export const checkCredentialAmount = async (
  authenticator: string,
  amount: number,
) => {
  const credentials = await getWebAuthnCredentials(browser, authenticator)
  expect(credentials.length).toBe(amount)
}
