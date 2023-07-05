/**
 * @jest-environment jsdom
 */
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
import { ii, im, replaceActorIdentity } from "@nfid/integration"

import {
  Chain,
  ecdsaGetAnonymous,
  ecdsaSign,
  getGlobalKeys,
  getPublicKey,
} from "./ecdsa"

const identity: JsonnableEd25519KeyIdentity = [
  "302a300506032b65700321003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
  "00000000000000000000000000000000000000000000000000000000000000003b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29",
]
describe("Lambda Sign/Register ECDSA", () => {
  jest.setTimeout(50000)

  describe("lambdaECDSA", () => {
    it("register ecdsa ETH", async function () {
      const mockedIdentity = Ed25519KeyIdentity.generate()
      const sessionKey = Ed25519KeyIdentity.generate()
      const chainRoot = await DelegationChain.create(
        mockedIdentity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
        {},
      )
      const di = DelegationIdentity.fromDelegation(sessionKey, chainRoot)
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
      const globalICIdentity = await getGlobalKeys(
        mockedIdentity,
        sessionKey,
        Chain.IC,
        ["74gpt-tiaaa-aaaak-aacaa-cai"],
      )
      expect(globalICIdentity.getPrincipal().toText()).toEqual(
        "5froz-eldwx-manjh-jgfni-kzgqa-eah4z-mgs4t-ozk3e-57b6o-jrsn4-bae",
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
      const sessionKey = Ed25519KeyIdentity.generate()
      const chainRoot = await DelegationChain.create(
        mockedIdentity,
        sessionKey.getPublicKey(),
        new Date(Date.now() + 3_600_000 * 44),
        {},
      )

      // NOTE: this is what we receive from authClient
      // https://github.com/dfinity/agent-js/blob/1d35889e0d0c0fd4a33d02a341bd90ee156da1cd/packages/auth-client/src/index.ts#L517
      const sessionPublicKey = new Uint8Array(sessionKey.getPublicKey().toDer())

      const di = DelegationIdentity.fromDelegation(sessionKey, chainRoot)
      const delegationChain = await ecdsaGetAnonymous(
        "nfid.one",
        sessionPublicKey,
        di,
        Chain.IC,
      )
      const actualIdentity = DelegationIdentity.fromDelegation(
        sessionKey,
        delegationChain,
      )
      expect(actualIdentity.getPrincipal().toText()).toEqual(
        "hnjwm-ephxs-bqhnh-5cwrm-7ze5g-cgjuw-burgh-v6dqf-hgyrb-z5l2u-hae",
      )
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
