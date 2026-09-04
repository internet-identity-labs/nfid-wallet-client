import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

import { authState } from "../authentication"
import { walletStorage } from "../authentication/storage"
import { serializeUserIdData } from "../authentication/user-id-data"
import { im, replaceActorIdentity, userRegistry } from "../actors"
import { RootWallet } from "../identity-manager/profile"
import {
  fromMnemonicWithoutValidation,
  IC_DERIVATION_PATH,
} from "../internet-identity/ed25519"
import { getIdentity, getLambdaActor } from "../lambda/util"
import { deleteAccountService } from "./delete-account.service"
import { DeletionMode } from "./enum/deletion-mode.enum"
import { IncorrectCodeError } from "./error/incorrect-code.error"
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

  it("should delete account via EMAIL step when correct code is provided", async () => {
    // Given an IM account with email, authState returning that email, and lambda confirming the code
    const { principal } = await createAccount("delete-spec-email-v1", {
      email: TEST_EMAIL,
    })
    mockUserIdData(principal, TEST_EMAIL)
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
    global.fetch = fetchMock

    const plan = await deleteAccountService.getPlan()
    await deleteAccountService.prepareStep(plan)

    const profileKey = `user_profile_data_someSessionKey`
    jest.spyOn(walletStorage, "getAllKeys").mockResolvedValue([profileKey])
    jest.spyOn(walletStorage, "get").mockImplementation(async (key: string) => {
      if (key === profileKey)
        return serializeUserIdData({
          userId: principal,
          publicKey: principal,
          anchor: plan.account.anchor,
          wallet: RootWallet.NFID,
          cacheVersion: "1",
        })
      return null
    })
    const removeAllSpy = jest
      .spyOn(walletStorage, "removeAll")
      .mockResolvedValue()
    jest.spyOn(walletStorage, "set").mockResolvedValue()

    // When the full deletion flow is executed with a valid code
    const result = await deleteAccountService.executeStep(plan, "123456")

    // Then EMAIL step was required, lambda received correct params, account is fully deleted, and the local wallet profile entry is removed
    expect(plan.steps).toContain(DeletionMode.EMAIL)
    expect(result.isCompleted).toBe(true)
    const [[, sendOptions], [, confirmOptions]] = fetchMock.mock.calls
    expect(JSON.parse(sendOptions.body)).toMatchObject({
      email: TEST_EMAIL,
      principal,
    })
    expect(JSON.parse(confirmOptions.body)).toMatchObject({
      email: TEST_EMAIL,
      code: "123456",
    })
    expect(removeAllSpy).toHaveBeenCalledWith([profileKey])
    const { status_code, error } = await im.get_account()
    expect(status_code).toBe(404)
    expect(error[0]).toBe("Unable to find Account")
  })

  it("should throw IncorrectCodeError when wrong email deletion code is submitted", async () => {
    // Given an IM account with email, authState returning that email, and lambda rejecting the code
    const { principal } = await createAccount("delete-spec-email-v2", {
      email: TEST_EMAIL,
    })
    mockUserIdData(principal, TEST_EMAIL)
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Invalid deletion code",
      })
    global.fetch = fetchMock

    // When the email step is prepared and executed with a wrong code
    const plan = await deleteAccountService.getPlan()
    await deleteAccountService.prepareStep(plan)
    await expect(
      deleteAccountService.executeStep(plan, "wrong"),
    ).rejects.toThrow(IncorrectCodeError)

    // Then IncorrectCodeError is thrown and the wrong code was passed to lambda; account still exists
    const [[, sendOptions], [, confirmOptions]] = fetchMock.mock.calls
    expect(JSON.parse(sendOptions.body)).toMatchObject({
      email: TEST_EMAIL,
      principal,
    })
    expect(JSON.parse(confirmOptions.body)).toMatchObject({
      email: TEST_EMAIL,
      code: "wrong",
    })
    const { status_code } = await im.get_account()
    expect(status_code).toBe(200)
  })

  it("should chain RECOVERY_PHRASE then EMAIL steps when both are configured on the account", async () => {
    // Given an account with both email and a recovery access point, and lambda confirming the code
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
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
    global.fetch = fetchMock

    const authSetSpy = jest.spyOn(authState, "set")

    // When RECOVERY_PHRASE step is executed first, then EMAIL step
    const plan = await deleteAccountService.getPlan()
    await deleteAccountService.prepareStep(plan)
    const afterRecovery = await deleteAccountService.executeStep(
      plan,
      RECOVERY_SEED_PHRASE,
    )
    await deleteAccountService.prepareStep(afterRecovery)
    const result = await deleteAccountService.executeStep(
      afterRecovery,
      "123456",
    )

    // Then both steps were required in order, the session identity was switched to the recovery identity
    // after the seed phrase step, lambda received correct params, and the account is fully deleted
    const [[, sendOptions], [, confirmOptions]] = fetchMock.mock.calls
    const { identity: signedInIdentity } = authSetSpy.mock.calls[0][0]
    const signedInPrincipal = Principal.selfAuthenticating(
      signedInIdentity!.getPublicKey().toDer(),
    ).toText()
    expect(authSetSpy).toHaveBeenCalledTimes(1)
    expect(signedInPrincipal).toBe(recoveryPrincipal)
    expect(signedInPrincipal).not.toBe(principal)

    expect(plan.steps).toEqual([
      DeletionMode.RECOVERY_PHRASE,
      DeletionMode.EMAIL,
    ])
    expect(afterRecovery.isCompleted).toBe(false)
    expect(result.isCompleted).toBe(true)
    expect(JSON.parse(sendOptions.body)).toMatchObject({
      email: TEST_EMAIL,
      principal,
    })
    expect(JSON.parse(confirmOptions.body)).toMatchObject({
      email: TEST_EMAIL,
      code: "123456",
    })
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
