import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { im, passkeyStorage, replaceActorIdentity } from "@nfid/integration"

import { getPasskey, removePasskeys, storePasskey } from "./passkey"
import { getIdentity, getLambdaActor } from "./util"

describe("Passkey test", () => {
  jest.setTimeout(80000)
  it("store/get", async function () {
    await storePasskey("testKey", "testData")
    const response = await getPasskey(["testKey"])
    expect(response[0].key).toEqual("testKey")
    expect(response[0].data).toEqual("testData")
  })

  it("store/get canister storage", async function () {
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
    }
    await replaceActorIdentity(im, di)
    await replaceActorIdentity(passkeyStorage, di)
    await im.remove_account()
    const account = await im.create_account(accountRequest as any)
    const anchor = account.data[0]?.anchor
    expect(anchor! >= 200_000_000).toBeTruthy()

    await removePasskeys()
    await storePasskey("testKey", "testData")
    await storePasskey("testKey2", "testData2")
    const response = await getPasskey(["testKey"])
    expect(response[0].key).toEqual("testKey")
    expect(response[0].data).toEqual("testData")
  })
})
