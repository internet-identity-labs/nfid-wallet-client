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
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { networks, TransactionBuilder } from "bitcoinjs-lib"
import fetch from "node-fetch"

import { WALLET_SCOPE } from "@nfid/config"

import { ii, im, replaceActorIdentity } from "../actors"
import {
  Chain,
  ecdsaGetAnonymous,
  getGlobalKeys,
  getGlobalKeysThirdParty,
  getPublicKey,
  renewDelegationThirdParty,
} from "./ecdsa"
import { LocalStorageMock } from "./local-storage-mock"

const identity: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]

describe("Lambda Sign/Register ECDSA", () => {
  jest.setTimeout(80000)
  const expectedGlobalAcc =
    "5vmgr-rh2gt-xlv6s-xzynd-vsg5l-2oodj-nomhe-mpv4y-6rgpw-cmwyz-bqe"
  describe("lambdaECDSA", () => {
    const localStorageMock = new LocalStorageMock()

    beforeAll(() => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
    })

    it("get global IC keys", async function () {
      const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(identity)
      const sessionKey = Ed25519KeyIdentity.generate()
      const chainRoot = await DelegationChain.create(
        mockedIdentity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
        {},
      )
      const delegationIdentity = DelegationIdentity.fromDelegation(
        sessionKey,
        chainRoot,
      )

      const globalICIdentity = await getGlobalKeys(
        delegationIdentity,
        Chain.IC,
        ["74gpt-tiaaa-aaaak-aacaa-cai"],
      )
      expect(globalICIdentity.getPrincipal().toText()).toEqual(
        expectedGlobalAcc,
      )
      const principal = await getPublicKey(delegationIdentity, Chain.IC)
      expect(principal).toEqual(expectedGlobalAcc)
      await replaceActorIdentity(ii, globalICIdentity)
      try {
        await ii.get_principal(BigInt(1), WALLET_SCOPE)
      } catch (e: any) {
        expect(e.message).toContain("Forbidden")
      }
      try {
        await im.get_account()
      } catch (e) {
        throw Error("Should not fail")
      }
    })

    it("get anonymous IC keys", async function () {
      const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(identity)

      const nfidSessionKey = Ed25519KeyIdentity.generate()
      const chainRoot = await DelegationChain.create(
        mockedIdentity,
        nfidSessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
        {},
      )
      const nfidDelegationIdentity = DelegationIdentity.fromDelegation(
        nfidSessionKey,
        chainRoot,
      )

      const dappSessionKey = Ed25519KeyIdentity.generate()
      // NOTE: this is what we receive from authClient
      // https://github.com/dfinity/agent-js/blob/1d35889e0d0c0fd4a33d02a341bd90ee156da1cd/packages/auth-client/src/index.ts#L517
      const dappSessionPublicKey = new Uint8Array(
        dappSessionKey.getPublicKey().toDer(),
      )

      const delegationChain = await ecdsaGetAnonymous(
        "nfid.one",
        dappSessionPublicKey,
        nfidDelegationIdentity,
        Chain.IC,
      )
      const actualIdentity = DelegationIdentity.fromDelegation(
        dappSessionKey,
        delegationChain,
      )
      const actualPrincipalId = actualIdentity.getPrincipal().toText()
      console.debug("actualPrincipalId", actualPrincipalId)

      expect(actualPrincipalId).toEqual(
        "hnjwm-ephxs-bqhnh-5cwrm-7ze5g-cgjuw-burgh-v6dqf-hgyrb-z5l2u-hae",
      )
    })

    it("get third party global keys", async function () {
      const canisterId = "irshc-3aaaa-aaaam-absla-cai"
      const mockedIdentity = Ed25519KeyIdentity.fromParsedJson(identity)

      const nfidSessionKey = Ed25519KeyIdentity.generate()
      const nfidSessionPublicKey = new Uint8Array(
        nfidSessionKey.getPublicKey().toDer(),
      )
      const chainRoot = await DelegationChain.create(
        mockedIdentity,
        nfidSessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
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

      expect(actualPrincipalId).toEqual(expectedGlobalAcc)

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
      const agent: Agent = await new HttpAgent({
        host: "https://ic0.app",
        identity: actualIdentity,
      })
      const idlFactory: IDL.InterfaceFactory = ({ IDL }) =>
        IDL.Service({
          get_principal: IDL.Func([], [IDL.Text], []),
        })
      const actor: ActorSubclass = Actor.createActor(idlFactory, {
        agent,
        canisterId: "irshc-3aaaa-aaaam-absla-cai",
      })
      const result = (await actor["get_principal"]()) as string[]
      console.log(result)

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
