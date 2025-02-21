/**
 * @jest-environment jsdom
 */
import { Actor, ActorSubclass, Agent, HttpAgent } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"

import {
  AccessPointRequest,
  HTTPAccountRequest,
} from "../_ic_api/identity_manager.d"
import { delegationFactory, im, replaceActorIdentity } from "../actors"
import { Chain } from "../lambda/lambda-delegation"
import { getIdentity, getLambdaActor } from "../lambda/util"
import {
  getAnonymousDelegation,
  getGlobalDelegation,
  getGlobalDelegationChain,
  getPublicKey,
  renewDelegationThirdParty,
} from "./delegation-i"

const identity = getIdentity("97654321876543218765432187654399")

describe.skip("Lambda Sign/Register Delegation Factory", () => {
  jest.setTimeout(80000)
  describe("lambdaECDSA", () => {
    it("register new user and check anchor/principal", async function () {
      const mockedIdentity = Ed25519KeyIdentity.generate()

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
      const deviceData: AccessPointRequest = {
        icon: "Icon",
        device: "Global",
        pub_key: di.getPrincipal().toText(),
        browser: "Browser",
        device_type: {
          Email: null,
        },
        credential_id: [],
      }
      const accountRequest: HTTPAccountRequest = {
        email: [email],
        access_point: [deviceData],
        wallet: [{ NFID: null }],
        anchor: BigInt(0),
        name: [],
        challenge_attempt: [],
      }
      await replaceActorIdentity(im, di)
      await im.remove_account()
      const account = await im.create_account(accountRequest)
      const anchor = account.data[0]?.anchor
      expect(anchor! >= 200_000_000).toBeTruthy()
      const principalText = await getPublicKey(di)
      expect(Principal.fromText(principalText).isAnonymous()).toBeFalsy()
    })

    it("get global keys with canister signature", async function () {
      const sessionKey = Ed25519KeyIdentity.generate()
      const chainRoot = await DelegationChain.create(
        identity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 55),
        {},
      )
      const delegationIdentity = DelegationIdentity.fromDelegation(
        sessionKey,
        chainRoot,
      )

      await replaceActorIdentity(im, delegationIdentity)
      await replaceActorIdentity(delegationFactory, delegationIdentity)
      const globalICIdentity = await getGlobalDelegation(delegationIdentity, [
        "74gpt-tiaaa-aaaak-aacaa-cai",
      ])

      const principalText = await getPublicKey(delegationIdentity)
      expect(principalText).toEqual(
        "uctde-u7vpl-wqc7d-b3lho-t47lj-hn2xi-aezu2-mqgmo-ry3f4-rausf-2ae",
      )
      expect(globalICIdentity.getPrincipal().toText()).toEqual(principalText)
    })

    it("get anonymous delegation with the canister delegation", async function () {
      const sessionKey = Ed25519KeyIdentity.generate()
      const chainRoot = await DelegationChain.create(
        identity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 55),
        {},
      )
      const delegationIdentity = DelegationIdentity.fromDelegation(
        sessionKey,
        chainRoot,
      )

      const dappSessionKey = Ed25519KeyIdentity.generate()
      // NOTE: this is what we receive from authClient
      const dappSessionPublicKey = new Uint8Array(
        dappSessionKey.getPublicKey().toDer(),
      )

      const anon = await getAnonymousDelegation(
        "nfid.two",
        dappSessionPublicKey,
        delegationIdentity,
      )

      const response = DelegationIdentity.fromDelegation(dappSessionKey, anon)
      const principalText = await getPublicKey(delegationIdentity, Chain.IC)

      expect(
        "w5436-o53mi-v5s4u-2ttqo-mtdju-wex4r-w5ap7-hastg-zvzue-fp7du-6qe",
      ).toEqual(response.getPrincipal().toText())

      expect(response.getPrincipal().toText()).not.toEqual(principalText)
      const anonGlobal = await getAnonymousDelegation(
        "nfid.one",
        dappSessionPublicKey,
        delegationIdentity,
      )
      const responseGlobal = DelegationIdentity.fromDelegation(
        dappSessionKey,
        anonGlobal,
      )
      expect(responseGlobal.getPrincipal().toText()).toEqual(principalText)

      await replaceActorIdentity(im, responseGlobal)
      const acc = await im.get_account()
      expect(acc.error.length).toEqual(1)
    })

    it("get third party global keys canister delegation", async function () {
      const canisterId = "irshc-3aaaa-aaaam-absla-cai"

      const nfidSessionKey = Ed25519KeyIdentity.generate()
      const nfidSessionPublicKey = new Uint8Array(
        nfidSessionKey.getPublicKey().toDer(),
      )
      const chainRoot = await DelegationChain.create(
        identity,
        nfidSessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 55),
        {},
      )
      const nfidDelegationIdentity = DelegationIdentity.fromDelegation(
        nfidSessionKey,
        chainRoot,
      )

      try {
        await renewDelegationThirdParty(
          nfidDelegationIdentity,
          [canisterId, "irshc-3aaaa-aaaam-absla-cai"],
          "nfid.one",
          nfidSessionPublicKey,
        )
        fail("Should not come here")
      } catch (e: any) {
        expect(e.message).toContain("not found")
      }

      const dappSessionKey = Ed25519KeyIdentity.generate()
      // NOTE: this is what we receive from authClient
      // https://github.com/dfinity/agent-js/blob/1d35889e0d0c0fd4a33d02a341bd90ee156da1cd/packages/auth-client/src/index.ts#L517
      const dappSessionPublicKey = new Uint8Array(
        dappSessionKey.getPublicKey().toDer(),
      )

      const delegationChain = await getGlobalDelegationChain(
        nfidDelegationIdentity,
        [canisterId, "irshc-3aaaa-aaaam-absla-cai"],
        dappSessionPublicKey,
        "nfid.one",
      )

      const actualIdentity = DelegationIdentity.fromDelegation(
        dappSessionKey,
        delegationChain,
      )
      const actualPrincipalId = actualIdentity.getPrincipal().toText()
      console.debug("actualPrincipalId", actualPrincipalId)
      const principalText = await getPublicKey(nfidDelegationIdentity, Chain.IC)
      expect(principalText).toEqual(
        "uctde-u7vpl-wqc7d-b3lho-t47lj-hn2xi-aezu2-mqgmo-ry3f4-rausf-2ae",
      )
      expect(principalText).toEqual(actualPrincipalId)

      const delegationChainRenewed = await renewDelegationThirdParty(
        nfidDelegationIdentity,
        [canisterId, "irshc-3aaaa-aaaam-absla-cai"],
        "nfid.one",
        dappSessionPublicKey,
      )
      const renewedIdentity = DelegationIdentity.fromDelegation(
        dappSessionKey,
        delegationChainRenewed,
      )
      const renewedPrincipalId = renewedIdentity.getPrincipal().toText()
      expect(actualPrincipalId).toEqual(renewedPrincipalId)
      const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
        IDL.Service({
          get_principal: IDL.Func([], [IDL.Text], []),
        })
      const agent2: Agent = await new HttpAgent({
        host: "https://ic0.app",
        identity: renewedIdentity,
      })
      const actor2: ActorSubclass = Actor.createActor(idlFactory, {
        agent: agent2,
        canisterId,
      })
      const principalIdFromCanister = (await actor2[
        "get_principal"
      ]()) as string
      expect(renewedPrincipalId).toEqual(principalIdFromCanister)
    })
  })
})
