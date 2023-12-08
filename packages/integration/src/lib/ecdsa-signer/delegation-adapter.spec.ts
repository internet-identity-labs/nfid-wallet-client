/**
 * @jest-environment jsdom
 */
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import {
  recoverTypedSignature,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util"
import { ethers } from "ethers"
import { arrayify, hashMessage } from "ethers/lib/utils"

import { generateDelegationIdentity } from "../test-utils"
import { DelegationWalletAdapter } from "./delegation-adapter"

describe.skip("Wallet Adapter suite", () => {
  jest.setTimeout(200000)
  const url = `https://ethereum-node.rarible.com`

  it("sign message", async () => {
    const mockedIdentity = Ed25519KeyIdentity.generate()
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    const adapter = new DelegationWalletAdapter()
    const address = await adapter.getAddress(delegationIdentity)
    const message = "test_message"
    const signature = await adapter.signMessage(message, delegationIdentity)
    const keccak = hashMessage(message)
    const digestBytes = arrayify(keccak)
    const pk = ethers.utils.recoverPublicKey([...digestBytes], signature)
    const actual = ethers.utils.computeAddress(ethers.utils.arrayify(pk))
    expect(actual).toEqual(address)
  })

  it("nfid-wallet sign typed data", async () => {
    const mockedIdentity = Ed25519KeyIdentity.generate()
    const delegationIdentity: DelegationIdentity =
      await generateDelegationIdentity(mockedIdentity)
    const adapter = new DelegationWalletAdapter()
    //request address to initiate wallet
    const address = await adapter.getAddress(delegationIdentity)
    const data = JSON.parse(
      '{"primaryType":"Order","domain":{"name":"Exchange","version":"2","verifyingContract":"0x02afbd43cad367fcb71305a2dfb9a3928218f0c1","chainId":5},"types":{"EIP712Domain":[{"type":"string","name":"name"},{"type":"string","name":"version"},{"type":"uint256","name":"chainId"},{"type":"address","name":"verifyingContract"}],"AssetType":[{"name":"assetClass","type":"bytes4"},{"name":"data","type":"bytes"}],"Asset":[{"name":"assetType","type":"AssetType"},{"name":"value","type":"uint256"}],"Order":[{"name":"maker","type":"address"},{"name":"makeAsset","type":"Asset"},{"name":"taker","type":"address"},{"name":"takeAsset","type":"Asset"},{"name":"salt","type":"uint256"},{"name":"start","type":"uint256"},{"name":"end","type":"uint256"},{"name":"dataType","type":"bytes4"},{"name":"data","type":"bytes"}]},"message":{"maker":"0x5d88229726c01f00fdefed1e70bd628407dc07ce","makeAsset":{"assetType":{"assetClass":"0x73ad2146","data":"0x000000000000000000000000d8560c88d1dc85f9ed05b25878e366c49b68bef9c3217ef1d6027b5ad5404b21a911b952b5f728b4000000000000000000000002"},"value":"1"},"taker":"0x0000000000000000000000000000000000000000","takeAsset":{"assetType":{"assetClass":"0xaaaebeba","data":"0x"},"value":"1000000000000000"},"salt":"0x735d4f76838af5686a9a127ec4200b5682f72ebb0b8732e422cfa4d6d47fb4a6","start":0,"end":0,"dataType":"0x2fa3cfd3","data":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e812345678900000000000000000000000000123456789face09616c6c64617461"}}',
    )
    const nfidSignature = await adapter.signTypedData(data, delegationIdentity)
    const actual = recoverTypedSignature({
      data: {
        types: data.types,
        primaryType: data.primaryType,
        domain: data.domain,
        message: data.message,
      },
      signature: nfidSignature,
      version: SignTypedDataVersion.V4,
    })
    expect(actual).toEqual(address.toLowerCase())
  })

  it("connect provider", async () => {
    const adapter = new DelegationWalletAdapter()
    adapter.connectProvider(url)
    expect(adapter.getProvider()?._isProvider).toBe(true)
  })
})
