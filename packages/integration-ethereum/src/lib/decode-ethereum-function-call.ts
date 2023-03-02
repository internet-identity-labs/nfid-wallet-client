import { Collection, Item } from "@rarible/api-client"
import { EthersEthereum } from "@rarible/ethers-ethereum"
import { createRaribleSdk } from "@rarible/sdk"
import { ethers } from "ethers"

import {
  CONTRACT_TOKEN_ID,
  DecodedFunctionCall,
  ERC1155_LAZY_TYPE,
  ERC721_LAZY_TYPE,
  abi,
} from "./constant"

const ethereum = new EthersEthereum(ethers.Wallet.createRandom())
const sdk = createRaribleSdk(null, "testnet")

const decoders: { [key: string]: any } = {
  "0xd8f960c1": { type: ERC721_LAZY_TYPE, decoder: decodeLazy },
  "0x1cdfaa40": { type: ERC1155_LAZY_TYPE, decoder: decodeLazy },
  "0x973bb640": { type: CONTRACT_TOKEN_ID, decoder: decode },
  "0x73ad2146": { type: CONTRACT_TOKEN_ID, decoder: decode },
}

export async function decodeToken(
  data: string,
): Promise<Item & { collectionData: Collection }> {
  const decodedData = await decodeEthereumFunctionCall(data)
  const type: string = decodedData.inputs[0][2]
  const tokenId = decoders[type]?.decoder(type, decodedData)
  const item = await sdk.apis.item.getItemById({ itemId: tokenId })
  const collection = await sdk.apis.collection.getCollectionById({
    collection: item.collection ?? "",
  })

  return {
    ...item,
    collectionData: collection,
  }
}

function decodeLazy(type: string, decoded: any): string {
  const nft =
    "0x0000000000000000000000000000000000000000000000000000000000000020" +
    (decoded.inputs[0][3] as string).substring(2)
  const ethereum = new EthersEthereum(ethers.Wallet.createRandom())
  const result = ethereum.decodeParameter(decoders[type]?.type, nft)
  return "ETHEREUM:" + result[0][0] + ":" + result[0][1][0]
}

function decode(type: string, decoded: any): string {
  const nft = decoded.inputs[0][3]
  const schema = decoders[type]?.type
  const id = ethereum.decodeParameter({ root: { schema } }, nft)
  return "ETHEREUM:" + id[0][0][0] + ":" + id[0][0][1]
}

export async function decodeEthereumFunctionCall(
  data: string,
): Promise<DecodedFunctionCall> {
  const result = abi.reduce<DecodedFunctionCall>(
    (acc, obj) => {
      const method = obj.name
      try {
        const ifc = new ethers.utils.Interface([])
        // FIXME:
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const _result = ifc.decodeFunctionData(
          // FIXME:
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ethers.utils.FunctionFragment.fromObject(obj),
          data,
        )
        const inputs = deepRemoveUnwantedArrayProperties(_result)
        acc.method = method
        acc.inputs = inputs
        acc.names = obj.inputs
          ? obj.inputs.map((x) => {
              if (x.type.includes("tuple")) {
                return [x.name, x.components?.map((a) => a.name)]
              } else {
                return x.name
              }
            })
          : []
        const types = obj.inputs
          ? obj.inputs.map((x) => {
              if (x.type.includes("tuple")) {
                return x
              } else {
                return x.type
              }
            })
          : []
        acc.types = types.map((t) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (t.components) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const arr = t.components.reduce(
              // FIXME:
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (acc, cur) => [...acc, cur.type],
              [],
            )
            const tupleStr = `(${arr.join(",")})`
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (t.type === "tuple[]") return tupleStr + "[]"
            return tupleStr
          }
          return t
        })
      } catch (error) {
        console.debug(`${method} is not a match`)
        return acc
      }

      return acc
    },
    { method: undefined, types: [], names: [], inputs: [] },
  )
  return result
}

function deepRemoveUnwantedArrayProperties(arr: any) {
  return [
    ...arr.map((item: any) => {
      if (Array.isArray(item)) return deepRemoveUnwantedArrayProperties(item)
      return item
    }),
  ]
}
