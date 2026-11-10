import { DelegationIdentity } from "@icp-sdk/core/identity"

import {
  AccessPointRequest,
  AccountResponse,
  HTTPAccountRequest,
} from "./_ic_api/identity_manager.d"
import { im, replaceActorIdentity } from "./actors"
import { getLambdaActor } from "./lambda/util"

/**
 * Returns the Identity Manager account of `identity`, creating an email-based
 * NFID account when it is missing. Dev canisters get reset, so integration
 * tests must not depend on accounts that were created by hand.
 *
 * Creating an account needs LAMBDA_IDENTITY (set in CI) to whitelist the test
 * email. When it returns, `im` acts as `identity` again.
 */
export async function ensureTestAccount(
  identity: DelegationIdentity,
): Promise<AccountResponse> {
  await replaceActorIdentity(im, identity)
  const existing = await im.get_account()
  if (existing.data[0]) return existing.data[0]

  const principal = identity.getPrincipal().toText()
  const email = `it-${principal.slice(0, 11)}@test.nfid.one`
  const lambda = await getLambdaActor()
  await lambda.add_email_and_principal_for_create_account_validation(
    email,
    principal,
    new Date().getMilliseconds(),
  )
  await replaceActorIdentity(im, identity)

  const accessPoint: AccessPointRequest = {
    icon: "Icon",
    device: "Integration tests",
    pub_key: principal,
    browser: "jest",
    device_type: { Email: null },
    credential_id: [],
  }
  const request: HTTPAccountRequest = {
    anchor: BigInt(0),
    access_point: [accessPoint],
    wallet: [{ NFID: null }],
    email: [email],
    name: [],
    challenge_attempt: [],
  }
  const created = await im.create_account(request)
  if (created.data[0]) return created.data[0]

  // Another test file may have created it in parallel.
  const retry = await im.get_account()
  if (retry.data[0]) return retry.data[0]
  throw new Error(
    `Could not create test account for ${principal}: ${
      created.error[0] ?? created.status_code
    }`,
  )
}
