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
  HTTPAccountRequest,
  AccessPointRequest,
} from "../_ic_api/identity_manager.d"
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
  jest.setTimeout(80000)

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
        email: [],
        access_point: [deviceData],
        wallet: [{ NFID: null }],
        anchor: BigInt(0),
      }
      await replaceActorIdentity(im, di)

      await im.create_account(accountRequest)
      const pubKey = await getPublicKey(di, Chain.ETH)
      const keccak = hashMessage("test_message")
      const signature = await ecdsaSign(keccak, di, Chain.ETH)
      const digestBytes = arrayify(keccak)
      const pk = ethers.utils.recoverPublicKey(digestBytes, signature)
      expect(pk).toEqual(pubKey)
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
