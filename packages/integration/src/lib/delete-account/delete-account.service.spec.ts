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
import type { AccessPointResponse } from "../_ic_api/identity_manager.d"

const TEST_EMAIL = "delete-account-spec@test.test"
const RECOVERY_MNEMONIC =
  "vessel ladder alter error federal sibling chat ability sun glass valve picture"
const RECOVERY_SEED_PHRASE = `10001 ${RECOVERY_MNEMONIC}`

// Prevent real ICP canister calls by mocking getLambdaActor (requires LAMBDA_IDENTITY env var)
jest.mock("../lambda/util", () => ({
  ...jest.requireActual("../lambda/util"),
  getLambdaActor: jest.fn().mockResolvedValue({
    add_email_and_principal_for_create_account_validation: jest
      .fn()
      .mockResolvedValue({}),
  }),
}))

function makeAccessPoint(
  principal: string,
  type: "Email" | "Recovery",
): AccessPointResponse {
  return {
    icon: "Icon",
    device: type === "Recovery" ? "Recovery" : "Browser",
    device_type: type === "Recovery" ? { Recovery: null } : { Email: null },
    browser: "Browser",
    last_used: BigInt(0),
    principal_id: principal,
    credential_id: [],
  }
}

function makeAccountResponse(
  principal: string,
  options: { email?: string; recoveryPrincipal?: string } = {},
) {
  const accessPoints: AccessPointResponse[] = [
    makeAccessPoint(
      principal,
      options.recoveryPrincipal ? "Recovery" : "Email",
    ),
  ]
  if (options.recoveryPrincipal && options.email) {
    // Account has both recovery (primary) and an email access point
    accessPoints[0] = makeAccessPoint(options.recoveryPrincipal, "Recovery")
    accessPoints.push(makeAccessPoint(principal, "Email"))
  } else if (options.recoveryPrincipal) {
    accessPoints[0] = makeAccessPoint(options.recoveryPrincipal, "Recovery")
  }
  return {
    name: [] as [],
    anchor: BigInt(0),
    access_points: accessPoints,
    personas: [] as [],
    is2fa_enabled: false,
    wallet: { NFID: null } as { NFID: null },
    principal_id: principal,
    phone_number: [] as [],
    email: (options.email ? [options.email] : []) as [] | [string],
  }
}

describe("deleteAccountService", () => {
  jest.setTimeout(120000)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should delete account via EMAIL step when correct code is provided", async () => {
    // Spy on canister methods before createAccount to prevent real ICP calls
    jest
      .spyOn(im, "create_account")
      .mockResolvedValue({ status_code: 200, data: [], error: [] })

    const { principal } = await createAccount("delete-spec-email-v1", {
      email: TEST_EMAIL,
    })
    mockUserIdData(principal, TEST_EMAIL)

    const mockAccount = makeAccountResponse(principal, { email: TEST_EMAIL })
    jest
      .spyOn(im, "get_account")
      .mockResolvedValueOnce({
        status_code: 200,
        data: [mockAccount],
        error: [],
      })
      .mockResolvedValueOnce({
        status_code: 404,
        data: [],
        error: ["Unable to find Account"],
      })
    jest
      .spyOn(im, "remove_account")
      .mockResolvedValue({ status_code: 200, data: [true], error: [] })
    jest
      .spyOn(userRegistry, "address_book_delete_all")
      .mockResolvedValue({ Ok: null })

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

    const result = await deleteAccountService.executeStep(plan, "123456")

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
    jest
      .spyOn(im, "create_account")
      .mockResolvedValue({ status_code: 200, data: [], error: [] })

    const { principal } = await createAccount("delete-spec-email-v2", {
      email: TEST_EMAIL,
    })
    mockUserIdData(principal, TEST_EMAIL)

    const mockAccount = makeAccountResponse(principal, { email: TEST_EMAIL })
    jest.spyOn(im, "get_account").mockResolvedValue({
      status_code: 200,
      data: [mockAccount],
      error: [],
    })

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Invalid deletion code",
      })
    global.fetch = fetchMock

    const plan = await deleteAccountService.getPlan()
    await deleteAccountService.prepareStep(plan)
    await expect(
      deleteAccountService.executeStep(plan, "wrong"),
    ).rejects.toThrow(IncorrectCodeError)

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
    const recoveryIdentity = await fromMnemonicWithoutValidation(
      RECOVERY_MNEMONIC,
      IC_DERIVATION_PATH,
    )
    const recoveryPrincipal = Principal.selfAuthenticating(
      recoveryIdentity.getPublicKey().toDer(),
    ).toText()

    jest
      .spyOn(im, "create_account")
      .mockResolvedValue({ status_code: 200, data: [], error: [] })
    jest
      .spyOn(im, "create_access_point")
      .mockResolvedValue({ status_code: 200, data: [], error: [] })

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

    const mockAccount = makeAccountResponse(principal, {
      email: TEST_EMAIL,
      recoveryPrincipal,
    })
    jest
      .spyOn(im, "get_account")
      .mockResolvedValueOnce({
        status_code: 200,
        data: [mockAccount],
        error: [],
      })
      .mockResolvedValueOnce({
        status_code: 404,
        data: [],
        error: ["Unable to find Account"],
      })
    jest
      .spyOn(im, "remove_account")
      .mockResolvedValue({ status_code: 200, data: [true], error: [] })
    jest
      .spyOn(userRegistry, "address_book_delete_all")
      .mockResolvedValue({ Ok: null })

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => "{}" })
    global.fetch = fetchMock

    // Mock authState.set to prevent createUserIdData from making additional im.get_account() calls
    const authSetSpy = jest.spyOn(authState, "set").mockResolvedValue()

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
    const recoveryIdentity = await fromMnemonicWithoutValidation(
      RECOVERY_MNEMONIC,
      IC_DERIVATION_PATH,
    )
    const recoveryPrincipal = Principal.selfAuthenticating(
      recoveryIdentity.getPublicKey().toDer(),
    ).toText()

    jest
      .spyOn(im, "create_account")
      .mockResolvedValue({ status_code: 200, data: [], error: [] })

    const { principal } = await createAccount("delete-spec-recovery-v2", {
      recoveryPrincipal,
    })
    mockUserIdData(principal)

    const mockAccount = makeAccountResponse(principal, { recoveryPrincipal })
    jest.spyOn(im, "get_account").mockResolvedValue({
      status_code: 200,
      data: [mockAccount],
      error: [],
    })

    const plan = await deleteAccountService.getPlan()

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
