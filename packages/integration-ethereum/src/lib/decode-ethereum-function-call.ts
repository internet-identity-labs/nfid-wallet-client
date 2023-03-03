import { EthersEthereum } from "@rarible/ethers-ethereum"
import { createRaribleSdk } from "@rarible/sdk"
import { ethers } from "ethers"

import {
  CONTRACT_TOKEN_ID,
  DecodedFunctionCall,
  ERC1155_LAZY_TYPE,
  ERC721_LAZY_TYPE,
  abi,
  CollectionRequest,
  DecodeResponse,
} from "./constant"

const ethereum = new EthersEthereum(ethers.Wallet.createRandom())
const sdk = createRaribleSdk(null, "testnet")

const decoders: { [key: string]: any } = {
  "0xd8f960c1": { type: ERC721_LAZY_TYPE, decoder: decodeTokenIdLazy },
  "0x1cdfaa40": { type: ERC1155_LAZY_TYPE, decoder: decodeTokenIdLazy },
  "0x973bb640": { type: CONTRACT_TOKEN_ID, decoder: decodeTokenId },
  "0x73ad2146": { type: CONTRACT_TOKEN_ID, decoder: decodeTokenId },
}

const decs: {
  [key: string]: (x: DecodedFunctionCall) => Promise<DecodeResponse>
} = {
  directPurchase: decodeToken,
  createToken: decodeCollection,
}

const methods = {
  createToken: (x: any): CollectionRequest => {
    return {
      name: x.inputs[0],
      symbol: x.inputs[1],
      baseURI: x.inputs[2],
      contractURI: x.inputs[3],
      isPrivate: !Array.isArray(x.inputs[4]),
    }
  },
}

export async function decode(data: string): Promise<DecodeResponse> {
  const decodedData = await decodeEthereumFunctionCall(data)
  const method = decodedData.method

  if (!method) {
    throw new Error("No method found")
  }

  return decs[method](decodedData)
}

export async function decodeTokenByAssetClass(type: string, data: string) {
  const tokenId = decoders[type]?.decoder(type, data)
  return sdk.apis.item.getItemById({ itemId: tokenId })
}

async function decodeCollection(
  data: DecodedFunctionCall,
): Promise<DecodeResponse> {
  return {
    interface: "CollectionRequest",
    method: "createToken",
    data: methods.createToken(data),
  }
}

async function decodeToken(data: DecodedFunctionCall): Promise<DecodeResponse> {
  const type: string = data.inputs[0][2]
  const tokenId = decoders[type]?.decoder(type, data.inputs[0][3])
  const item = await sdk.apis.item.getItemById({ itemId: tokenId })
  const collection = await sdk.apis.collection.getCollectionById({
    collection: item.collection ?? "",
  })

  return {
    interface: "Item",
    method: "directPurchase",
    data: {
      ...item,
      collectionData: collection,
    },
  }
}

function decodeTokenIdLazy(type: string, data: any): string {
  const nft =
    "0x0000000000000000000000000000000000000000000000000000000000000020" +
    (data as string).substring(2)
  const ethereum = new EthersEthereum(ethers.Wallet.createRandom())
  const result = ethereum.decodeParameter(decoders[type]?.type, nft)
  return "ETHEREUM:" + result[0][0] + ":" + result[0][1][0]
}

function decodeTokenId(type: string, data: any): string {
  const nft = data
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
