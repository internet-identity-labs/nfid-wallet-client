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
import {im, replaceActorIdentity} from "../actors"
import {
  Chain,
  ecdsaGetAnonymous,
  getGlobalKeys,
  getGlobalKeysThirdParty,
  getPublicKey,
  renewDelegationThirdParty,
} from "./ecdsa"
import { LocalStorageMock } from "./local-storage-mock"
import { getIdentity, getLambdaActor } from "./util"

const identity = getIdentity("97654321876543218765432187654388")

describe("Lambda Sign/Register Delegation Factory", () => {
  jest.setTimeout(80000)
  describe("lambdaECDSA", () => {
    const localStorageMock = new LocalStorageMock()

    beforeAll(() => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
    })

    it("register new user and check anchor/principal", async function () {
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
      const globalICIdentity = await getGlobalKeys(
        delegationIdentity,
        Chain.IC,
        ["74gpt-tiaaa-aaaak-aacaa-cai"],
      )

      const principalText = await getPublicKey(delegationIdentity, Chain.IC)
      expect(principalText).toEqual(
        "mqv3l-ovus6-4k6vq-tw2bx-4fxqm-snv6c-73mzp-qh2b4-qlsk4-g2mrl-fae",
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

      const anon = await ecdsaGetAnonymous(
        "nfid.two",
        dappSessionPublicKey,
        delegationIdentity,
      )

      const response = DelegationIdentity.fromDelegation(dappSessionKey, anon)
      const principalText = await getPublicKey(delegationIdentity, Chain.IC)

      expect(
        "uf63z-wcfk4-qlxdj-rwhxw-vvfgz-ckfji-viyi2-znlst-kguug-ttnxg-lqe",
      ).toEqual(response.getPrincipal().toText())
      expect(response.getPrincipal().toText()).not.toEqual(principalText)
      const anonGlobal = await ecdsaGetAnonymous(
        "nfid.one",
        dappSessionPublicKey,
        delegationIdentity,
      )
      const responseGlobal = DelegationIdentity.fromDelegation(
        dappSessionKey,
        anonGlobal,
      )
      expect(responseGlobal.getPrincipal().toText()).toEqual(principalText)
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

      const delegationChain = await getGlobalKeysThirdParty(
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
          "mqv3l-ovus6-4k6vq-tw2bx-4fxqm-snv6c-73mzp-qh2b4-qlsk4-g2mrl-fae",
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
