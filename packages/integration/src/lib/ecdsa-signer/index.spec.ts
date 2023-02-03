/**
 * @jest-environment jsdom
 */
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519"
import { BigNumber, ethers, Wallet } from "ethers"
import { arrayify, hashMessage } from "ethers/lib/utils"

import { getEcdsaPublicKey, signEcdsaMessage } from "."
import { EthWallet } from "./ecdsa-wallet"

const idd: JsonnableEd25519KeyIdentity = [
  "0402f7e13e782ad8bb2c4da69d00c14af52d4bf0f1cc20ddb52f117d7fff2e3678c950145102d87915c5688a218cdc4348407cd7b1fdb8256dade044309a2552cd",
  "fa1e290e2524ec98e24e49e95c0e30b43e9c96504715cea4d802269f80f638e6",
]

describe("ECDSA suite", () => {
  jest.setTimeout(200000)
  const rpcProvider = new ethers.providers.JsonRpcProvider(
    "https://ethereum-goerli-rpc.allthatnode.com",
  )
  const nfidWallet = new EthWallet(rpcProvider)
  it("ecdsa public key", async () => {
    const pk = await getEcdsaPublicKey()
    expect(pk.length > 0).toBe(true)
  })

  it("ecdsa sign message", async () => {
    const message = Array(32).fill(1)
    const signature = await signEcdsaMessage(message)
    expect(signature.length > 0).toBe(true)
  })

  it("ecdsa prepare signature", async () => {
    const message = "test_message"
    const hash = await nfidWallet.prepareSignature(message)
    const signature = await nfidWallet.getPreparedSignature(hash, message)
    expect(signature.length > 0).toBe(true)
  })

  it("nfid-wallet verify message", async () => {
    const address = await nfidWallet.getAddress()
    const message = "test_message"

    const signature = await nfidWallet.signMessage(message)

    const keccak = hashMessage(message)
    const digestBytes = arrayify(keccak)
    const pk = ethers.utils.recoverPublicKey([...digestBytes], signature)
    const actual = ethers.utils.computeAddress(ethers.utils.arrayify(pk))

    expect(actual).toEqual(address)
  })

  it.skip("nfid-wallet safeTransfer eip721", async () => {
    const contract = "0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"
    const to = "0xdC75e8c3aE765D8947aDBC6698a2403A6141D439"
    const tokenId =
      "80322369037599879817130611650014995038071054105692890356259348959353817268226"
    try {
      await nfidWallet.safeTransferFrom(to, contract, tokenId)
    } catch (e) {
      expect(JSON.stringify(e)).toContain(
        "transfer caller is not owner nor approved",
      )
    }
  })

  it.skip("nfid-wallet approve eip721", async () => {
    const contract = "0xd8560c88d1dc85f9ed05b25878e366c49b68bef9"
    const to = "0xdC75e8c3aE765D8947aDBC6698a2403A6141D439"
    const tokenId =
      "80322369037599879817130611650014995038071054105692890356259348959353817268226"
    try {
      await nfidWallet.approve(to, contract, tokenId)
    } catch (e) {
      expect(JSON.stringify(e)).toContain(
        "execution reverted: ERC721: approval to current owner",
      )
    }
  })

  it.skip("nfid-wallet approveForAll eip721", async () => {
    const contract = "0x1f419b9469d641d333805c4054ca3b65af54d315"
    const to = "0xdC75e8c3aE765D8947aDBC6698a2403A6141D439"
    const response = await nfidWallet.setApprovalForAll(to, contract, true)
    const wait = await response.wait()
    console.log(wait)
    expect(wait.events[0].data).toEqual(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    )
  })

  // to run this test you need to install geth or another local EVM
  // nice example howto:
  // https://dev.to/jeffersonxavier/create-your-own-private-blockchain-using-ethereum-52o5
  it.skip("nfid-wallet send transaction", async () => {
    const customHttpProvider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:8545",
    )
    const wallet = new Wallet(idd[1], customHttpProvider)
    const addressTo = await wallet.getAddress()
    const nfidWallet = new EthWallet(customHttpProvider)
    const address = await nfidWallet.getAddress()
    const gasPrice = await customHttpProvider.getGasPrice()
    const value = ethers.utils.parseEther("0.0000001")
    const gasLimit = BigNumber.from(100000)
    const trCount = await customHttpProvider.getTransactionCount(
      address,
      "latest",
    )
    const transaction = {
      from: address,
      to: addressTo,
      value: value,
      nonce: trCount,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    }
    try {
      const actual = await nfidWallet.sendTransaction(transaction)
      expect(actual.from).toEqual(address)
    } catch (e) {
      fail("Transaction failed" + e)
    }
  })
})
