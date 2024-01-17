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
import {
  networks,
  payments,
  Transaction,
  TransactionBuilder,
} from "bitcoinjs-lib"
import { ethers } from "ethers"
import { arrayify, hashMessage } from "ethers/lib/utils"
import fetch from "node-fetch"

import { WALLET_SCOPE } from "@nfid/config"

import {
  HTTPAccountRequest,
  AccessPointRequest,
} from "../_ic_api/identity_manager.d"
import { ii, im, replaceActorIdentity } from "../actors"
import {
  Chain,
  ecdsaGetAnonymous,
  ecdsaSign,
  getGlobalKeys,
  getGlobalKeysThirdParty,
  getPublicKey,
  renewDelegationThirdParty,
} from "./ecdsa"
import { LocalStorageMock } from "./local-storage-mock"
import { getIdentity, getLambdaActor } from "./util"

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

    it("register ecdsa ETH", async function () {
      const mockedIdentity = getIdentity("87654321876543218765432187654311")
      const sessionKey = Ed25519KeyIdentity.generate()
      const chainRoot = await DelegationChain.create(
        mockedIdentity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
        {},
      )
      const di = DelegationIdentity.fromDelegation(sessionKey, chainRoot)

      const email = "test@test.test"
      const principal = di.getPrincipal().toText()
      const lambdaActor = getLambdaActor()
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
      replaceActorIdentity(im, di)

      await im.remove_account()
      await im.create_account(accountRequest)

      const pubKey = await getPublicKey(di, Chain.ETH)
      const keccak = hashMessage("test_message")
      const signature = await ecdsaSign(keccak, di, Chain.ETH)
      const digestBytes = arrayify(keccak)
      const pk = ethers.utils.recoverPublicKey(digestBytes, signature)
      expect(pk).toEqual(pubKey)
    })

    it("register ecdsa BTC", async function () {
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
      const publicKey = await getPublicKey(delegationIdentity, Chain.BTC)
      const { address } = payments.p2pkh({
        pubkey: Buffer.from(publicKey, "hex"),
        network: networks.testnet,
      })
      expect(address).toEqual("mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc")
      const tx = await calc("mujCjK6xVJJYfkVp1u4WVvv8i3LE86giqc")
      const hex = tx.buildIncomplete().toHex()
      const signedTxHex = await ecdsaSign(hex, delegationIdentity, Chain.BTC)
      const txx = Transaction.fromHex(signedTxHex)
      expect(txx.ins.length).toEqual(1)
      expect(txx.outs[0].value).toEqual(10)
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

async function calc(address: string) {
  const apiEndpoint = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full`
  const response = await fetch(apiEndpoint)

  const json = await response.json()
  const inputs = json.txs.map((tx: any) => ({
    txid: tx.hash,
    vout: tx.outputs.findIndex((output: any) =>
      output.addresses.includes(address),
    ),
    value: tx.outputs.find((output: any) => output.addresses.includes(address))
      .value,
  }))
  const transactionValue = 10
  const txb = new TransactionBuilder(networks.testnet)
  inputs.sort((a: any, b: any) => b.value - a.value) // sort inputs by value, highest to lowest
  let inputTotal = 0
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const inputIndex = i // index of the input in the transaction

    txb.addInput(input.txid, input.vout)
    inputTotal += input.value

    if (inputTotal >= transactionValue) {
      break // stop adding inputs once the transaction value is covered
    }
  }
  if (inputTotal < transactionValue) {
    // not enough inputs to cover transaction value
    // handle error or insufficient funds
  }
  txb.addOutput(address, transactionValue)
  return txb
}
