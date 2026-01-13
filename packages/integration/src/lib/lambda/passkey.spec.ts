import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { im, passkeyStorage, replaceActorIdentity } from "@nfid/integration"

import { getPasskey, storePasskey } from "./passkey"
import { getIdentity, getLambdaActor } from "./util"

describe("Passkey test", () => {
  jest.setTimeout(80000)
  it("store/get", async () => {
    await storePasskey("testKey", "testData")
    const response = await getPasskey(["testKey"])
    expect(response[0].key).toEqual("testKey")
    expect(response[0].data).toEqual("testData")
  })

  it("store/get canister storage", async () => {
    const mockedIdentity = getIdentity("97654321876543218765432187654388")

    const sessionKey = Ed25519KeyIdentity.generate()
    const chainRoot = await DelegationChain.create(
      mockedIdentity,
      sessionKey.getPublicKey(),
      new Date(Date.now() + 3_600_000 * 55),
      {},
    )
    const di = DelegationIdentity.fromDelegation(sessionKey, chainRoot)

    const email = "test@test.test"
    const principal = di.getPrincipal().toText()
    const lambdaActor = await getLambdaActor()
    await lambdaActor.add_email_and_principal_for_create_account_validation(
      email,
      principal,
      new Date().getMilliseconds(),
    )
    const deviceData = {
      icon: "Icon",
      device: "Global",
      pub_key: di.getPrincipal().toText(),
      browser: "Browser",
      device_type: {
        Email: null,
      },
      credential_id: [],
    }
    const accountRequest = {
      email: [email],
      access_point: [deviceData],
      wallet: [{ NFID: null }],
      anchor: BigInt(0),
      name: [],
      challenge_attempt: [],
    }
    await replaceActorIdentity(im, di)
    await replaceActorIdentity(passkeyStorage, di)
    await im.remove_account()
    await sleep(1)
    let account
    try {
      account = await im.create_account(accountRequest as any)
    } catch (_e) {
      account = await im.create_account(accountRequest as any)
    }
    const anchor = account.data[0]?.anchor
    expect(anchor! >= 200_000_000).toBeTruthy()
    const key1 = (Math.random() + 1).toString(36).substring(7)
    const key2 = (Math.random() + 1).toString(36).substring(7)
    try {
      await storePasskey(key1, "testData")
    } catch (_e) {
      await storePasskey(key1, "testData")
    }
    try {
      await storePasskey(key2, "testData2")
    } catch (_e) {
      await storePasskey(key2, "testData2")
    }
    const response = await getPasskey([key1])
    expect(response[0].key).toEqual(key1)
    expect(response[0].data).toEqual("testData")
    const response2 = await getPasskey([key1, key2])
    expect(response2.length).toEqual(2)
    expect(response2[0].data).toEqual("testData")
    expect(response2[1].data).toEqual("testData2")
  })
})

const sleep = async (seconds: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}
