import { Principal } from "@dfinity/principal"

import { ic } from "@nfid/integration"

const ORIGIN_VALIDATION_REGEX =
  /^https:\/\/([\w-]+)(?:\.raw)?\.(?:ic0\.app|icp0\.io)$/

export const MAX_ALTERNATIVE_ORIGINS = 10

const fetchAlternativeOrigins = ic.isLocal
  ? "/fetch-alternative-origins"
  : AWS_FETCH_ALTERNATIVE_ORIGINS

export type ValidationResult =
  | { result: "valid" }
  | { result: "invalid"; message: string }

export const validateDerivationOrigin = async (
  authRequestOrigin: string,
  derivationOrigin?: string,
): Promise<ValidationResult> => {
  if (
    derivationOrigin === undefined ||
    derivationOrigin === authRequestOrigin
  ) {
    // this is the default behaviour -> no further validation necessary
    return { result: "valid" }
  }

  // check format of derivationOrigin
  const matches = ORIGIN_VALIDATION_REGEX.exec(derivationOrigin)
  if (matches === null) {
    return {
      result: "invalid",
      message: `derivationOrigin does not match regex "${ORIGIN_VALIDATION_REGEX.toString()}"`,
    }
  }

  try {
    const canisterId = Principal.fromText(matches[1]) // verifies that a valid canister id was matched

    // Regardless of whether the _origin_ (from which principals are derived) is on ic0.app or icp0.io, we always
    // query the list of alternative origins from icp0.io (official domain)
    const alternativeOriginsUrl = `${fetchAlternativeOrigins}/${canisterId.toText()}`
    const response = await fetch(
      // always fetch non-raw
      alternativeOriginsUrl,
      // fail on redirects
      {
        redirect: "error",
        headers: {
          Accept: "application/json",
        },
        // do not send cookies or other credentials
        credentials: "omit",
      },
    )

    if (response.status !== 200) {
      return {
        result: "invalid",
        message: `${derivationOrigin} failed validation for ${authRequestOrigin}`,
      }
    }

    const alternativeOriginsObj = (await response.json()) as {
      alternativeOrigins: string[]
    }
    console.log(">> ", { alternativeOriginsObj })

    // check for expected property
    if (!Array.isArray(alternativeOriginsObj?.alternativeOrigins)) {
      return {
        result: "invalid",
        message: `resource ${alternativeOriginsUrl} has invalid format: received ${alternativeOriginsObj}`,
      }
    }

    // check number of entries
    if (
      alternativeOriginsObj.alternativeOrigins.length > MAX_ALTERNATIVE_ORIGINS
    ) {
      return {
        result: "invalid",
        message: `Resource ${alternativeOriginsUrl} has too many entries: To prevent misuse at most ${MAX_ALTERNATIVE_ORIGINS} alternative origins are allowed.`,
      }
    }

    // check allowed alternative origins
    if (!alternativeOriginsObj.alternativeOrigins.includes(authRequestOrigin)) {
      return {
        result: "invalid",
        message: `"${authRequestOrigin}" is not listed in the list of allowed alternative origins. Allowed alternative origins: ${alternativeOriginsObj.alternativeOrigins}`,
      }
    }
  } catch (e: any) {
    return {
      result: "invalid",
      message: `An error occurred while validating the derivationOrigin "${derivationOrigin}" for alias domain "${authRequestOrigin}": ${e?.message}`,
    }
  }

  // all checks passed --> valid
  return { result: "valid" }
}
