import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

import { authState } from "../authentication"
import { im, replaceActorIdentity, userRegistry } from "../actors"
import { RootWallet } from "../identity-manager/profile"
import {
  fromMnemonicWithoutValidation,
  IC_DERIVATION_PATH,
} from "../internet-identity/ed25519"
import { getIdentity, getLambdaActor } from "../lambda/util"
import { deleteAccountService } from "./delete-account.service"
import { DeletionMode } from "./enum/deletion-mode.enum"
import { IncorrectSeedPhraseError } from "./error/incorrect-seed-phrase.error"

const TEST_EMAIL = "delete-account-spec@test.test"
const RECOVERY_MNEMONIC =
  "vessel ladder alter error federal sibling chat ability sun glass valve picture"
const RECOVERY_SEED_PHRASE = `10001 ${RECOVERY_MNEMONIC}`

describe("deleteAccountService", () => {
  jest.setTimeout(120000)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should require only the RECOVERY_PHRASE step when the account also has an email", async () => {
    // Given an account with both an email value and a recovery access point
    const recoveryIdentity = await fromMnemonicWithoutValidation(
      RECOVERY_MNEMONIC,
      IC_DERIVATION_PATH,
    )
    const recoveryPrincipal = Principal.selfAuthenticating(
      recoveryIdentity.getPublicKey().toDer(),
    ).toText()
    const { principal } = await createAccount("delete-spec-chain-v1", {
      email: TEST_EMAIL,
    })
    await im.create_access_point({
      icon: "Icon",
      device: "Recovery",
      pub_key: recoveryPrincipal,
      browser: "Browser",
      device_type: { Recovery: null },
      credential_id: [],
    })
    mockUserIdData(principal, TEST_EMAIL)
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    const authSetSpy = jest.spyOn(authState, "set")

    // When the plan is built and the recovery-phrase step is executed
    const plan = await deleteAccountService.getPlan()
    await deleteAccountService.prepareStep(plan)
    const result = await deleteAccountService.executeStep(
      plan,
      RECOVERY_SEED_PHRASE,
    )

    // Then the plan contains only the recovery step (no trailing EMAIL step),
    // the session identity was switched to the recovery identity, no email
    // lambda round-trip happened, and the account is fully deleted
    const { identity: signedInIdentity } = authSetSpy.mock.calls[0][0]
    const signedInPrincipal = Principal.selfAuthenticating(
      signedInIdentity!.getPublicKey().toDer(),
    ).toText()
    expect(authSetSpy).toHaveBeenCalledTimes(1)
    expect(signedInPrincipal).toBe(recoveryPrincipal)
    expect(signedInPrincipal).not.toBe(principal)

    expect(plan.steps).toEqual([DeletionMode.RECOVERY_PHRASE])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.isCompleted).toBe(true)
    const { status_code, error } = await im.get_account()
    expect(status_code).toBe(404)
    expect(error[0]).toBe("Unable to find Account")
  })

  it("should return only the DEFAULT step for an account that has an email value but no passkey or recovery", async () => {
    // Given an account with an email value and no passkey / recovery access point
    const { principal } = await createAccount("delete-spec-default-v1", {
      email: TEST_EMAIL,
    })
    mockUserIdData(principal, TEST_EMAIL)
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    // When the plan is built and executed
    const plan = await deleteAccountService.getPlan()
    await deleteAccountService.prepareStep(plan)
    const result = await deleteAccountService.executeStep(plan, "")

    // Then the only step is DEFAULT, no email lambda round-trip happened,
    // and the account is fully deleted on the single execute call
    expect(plan.steps).toEqual([DeletionMode.DEFAULT])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.isCompleted).toBe(true)
    const { status_code, error } = await im.get_account()
    expect(status_code).toBe(404)
    expect(error[0]).toBe("Unable to find Account")
  })

  it("should throw IncorrectSeedPhraseError when wrong recovery phrase is submitted", async () => {
    // Given an IM account with a Recovery access point and authState reporting no email
    const recoveryIdentity = await fromMnemonicWithoutValidation(
      RECOVERY_MNEMONIC,
      IC_DERIVATION_PATH,
    )
    const recoveryPrincipal = Principal.selfAuthenticating(
      recoveryIdentity.getPublicKey().toDer(),
    ).toText()
    const { principal } = await createAccount("delete-spec-recovery-v2", {
      recoveryPrincipal,
    })
    mockUserIdData(principal)

    // When the deletion is attempted with a phrase that does not match the registered principal
    const plan = await deleteAccountService.getPlan()

    // Then IncorrectSeedPhraseError is thrown; account still exists
    await expect(
      deleteAccountService.executeStep(
        plan,
        "10001 word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11",
      ),
    ).rejects.toThrow(IncorrectSeedPhraseError)
    const { status_code } = await im.get_account()
    expect(status_code).toBe(200)
  })
})

async function createDelegationIdentity(
  seed: string,
): Promise<DelegationIdentity> {
  const base = getIdentity(seed.padEnd(32, "0"))
  const sessionKey = Ed25519KeyIdentity.generate()
  const chain = await DelegationChain.create(
    base,
    sessionKey.getPublicKey(),
    new Date(Date.now() + 3_600_000 * 55),
    {},
  )
  return DelegationIdentity.fromDelegation(sessionKey, chain)
}

function mockUserIdData(userId: string, email?: string) {
  jest.spyOn(authState, "getUserIdData").mockReturnValue({
    email,
    userId,
    publicKey: userId,
    anchor: BigInt(0),
    wallet: RootWallet.NFID,
    cacheVersion: "1",
  })
}

async function createAccount(
  seed: string,
  options: { email?: string; recoveryPrincipal?: string } = {},
): Promise<{ identity: DelegationIdentity; principal: string }> {
  const identity = await createDelegationIdentity(seed)
  const principal = identity.getPrincipal().toText()
  await replaceActorIdentity(im, identity)
  await replaceActorIdentity(userRegistry, identity)
  if (options.email) {
    const lambdaActor = await getLambdaActor()
    await lambdaActor!.add_email_and_principal_for_create_account_validation(
      options.email,
      principal,
      new Date().getMilliseconds(),
    )
    await replaceActorIdentity(im, identity)
  }

  const { recoveryPrincipal } = options
  await im.create_account({
    email: options.email ? [options.email] : [],
    access_point: [
      {
        icon: "Icon",
        device: recoveryPrincipal ? "Recovery" : "Browser",
        pub_key: recoveryPrincipal ?? principal,
        browser: "Browser",
        device_type: recoveryPrincipal ? { Recovery: null } : { Email: null },
        credential_id: [],
      },
    ],
    wallet: [{ NFID: null }],
    anchor: BigInt(0),
    name: [],
    challenge_attempt: [],
  })

  return { identity, principal }
}
