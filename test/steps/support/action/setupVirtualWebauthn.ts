import assert from "assert"
import { WebAuthnCredential } from "test/setup"
import { command } from "webdriver"

const NFID_URL = "https://philipp.eu.ngrok.io"

export function originToRelyingPartyId(origin: string): string {
  return origin.replace(/https?:\/\/([.\w]+).*/, "$1")
}

/**
 * Adds custom commands for webauthn authenticator administration as documented here: https://webdriver.io/docs/customcommands/#add-more-webdriver-commands
 * @param browser browser to add the commands to
 */
export async function addCustomCommands(
  browser: WebdriverIO.Browser,
): Promise<void> {
  await browser.addCommand(
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
          required: true,
        },
        {
          name: "transport",
          type: "string",
          description: "The AuthenticatorTransport simulated",
          required: true,
        },
        {
          name: "hasResidentKey",
          type: "boolean",
          description:
            "If set to true the authenticator will support client-side discoverable credentials",
          required: true,
        },
        {
          name: "isUserConsenting",
          type: "boolean",
          description:
            "Determines the result of all user consent authorization gestures",
          required: true,
        },
      ],
    }),
  )

  await browser.addCommand(
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
  await browser.addCommand(
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
            description: "The id of the authenticator to remove",
            required: true,
          },
        ],
        parameters: [],
      },
    ),
  )

  // This adds a previously created credential, see https://www.w3.org/TR/webauthn-2/#sctn-automation-add-credential
  await browser.addCommand(
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
            description: "The id of the authenticator to remove",
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

export async function addVirtualAuthenticator(
  browser: WebdriverIO.Browser,
): Promise<string> {
  return await browser.addVirtualWebAuth("ctap2", "usb", true, true)
}

export async function removeVirtualAuthenticator(
  browser: WebdriverIO.Browser,
  authenticatorId: string,
): Promise<void> {
  return await browser.removeVirtualWebAuth(authenticatorId)
}

export async function getWebAuthnCredentials(
  browser: WebdriverIO.Browser,
  authId: string,
): Promise<WebAuthnCredential[]> {
  return await browser.getWebauthnCredentials(authId)
}

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
    await addCustomCommands(browser)
    const authenticator = await addVirtualAuthenticator(browser)
    return authenticator
  } catch (e) {
    console.debug("setupVirtualWebauthn", { e })
    assert(e, "Could not setup webauthn")
  }
}

export const storeWebAuthnCredential = async (authenticator: string) => {
  const credentials = await getWebAuthnCredentials(browser, authenticator)
  const rpId = originToRelyingPartyId(NFID_URL)
  await addWebAuthnCredential(browser, authenticator, credentials[0], rpId)
}
