import { EthersEthereum } from "@rarible/ethers-ethereum"
import { createRaribleSdk } from "@rarible/sdk"
import { ethers } from "ethers"
import { Interface, FunctionFragment, Fragment } from "ethers/lib/utils"

import {
  CONTRACT_TOKEN_ID,
  DecodedFunctionCall,
  ERC1155_LAZY_TYPE,
  ERC721_LAZY_TYPE,
  abi,
  DecodeResponse,
  TokenId,
  Method,
} from "./constant"

const ethereum = new EthersEthereum(ethers.Wallet.createRandom())
const sdk = createRaribleSdk(null, "testnet")

const decoders: {
  [key: string]: {
    type: object
    decoder: (type: string, data: string) => TokenId
  }
} = {
  "0xd8f960c1": { type: ERC721_LAZY_TYPE, decoder: decodeTokenIdLazy },
  "0x1cdfaa40": { type: ERC1155_LAZY_TYPE, decoder: decodeTokenIdLazy },
  "0x973bb640": { type: CONTRACT_TOKEN_ID, decoder: decodeTokenId },
  "0x73ad2146": { type: CONTRACT_TOKEN_ID, decoder: decodeTokenId },
}

const methods: {
  [key: string]: (x: DecodedFunctionCall) => Promise<DecodeResponse>
} = {
  directAcceptBid,
  burn,
  safeTransferFrom,
  bulkPurchase: async (x: DecodedFunctionCall): Promise<DecodeResponse> => {
    const promises = x.inputs[0].map(async (x: any) => {
      return {
        amount: (x[1] as ethers.BigNumber).toString(),
        fees: (x[2] as ethers.BigNumber).toString(),
        item: await decode(x[3]),
        marketId: x[0],
      }
    })

    const items = await Promise.all(promises)

    return Promise.resolve({
      interface: "BatchBuyRequest",
      method: "bulkPurchase",
      data: {
        allowFail: x.inputs[3] as boolean,
        feeRecipientFirst: parseInt(x.inputs[1], 16),
        feeRecipientSecond: parseInt(x.inputs[2], 16),
        items,
      },
    })
  },
  directPurchase: (x: DecodedFunctionCall): Promise<DecodeResponse> => {
    const type: string = x.inputs[0][2]
    const content: string = x.inputs[0][3]
    return decodeByAssetClass(type, content, "directPurchase")
  },
  createToken: (x: DecodedFunctionCall): Promise<DecodeResponse> => {
    return Promise.resolve({
      interface: "CollectionRequest",
      method: "createToken",
      data: {
        name: x.inputs[0],
        symbol: x.inputs[1],
        baseURI: x.inputs[2],
        contractURI: x.inputs[3],
        isPrivate: !Array.isArray(x.inputs[4]),
      },
    })
  },
  mintAndTransfer: (x: DecodedFunctionCall): Promise<DecodeResponse> => {
    console.log(JSON.stringify(x.inputs[0][2]))
    const creators = x.inputs[0][2].map((v: any) => {
      return {
        creator: v[0],
        value: (v[1] as ethers.BigNumber).toString(),
      }
    })
    return Promise.resolve({
      interface: "MintRequest",
      method: "mintAndTransfer",
      data: {
        tokenId: (x.inputs[0][0] as ethers.BigNumber).toString(),
        tokenURI: x.inputs[0][1],
        creators,
        royalties: x.inputs[0][3],
        signatures: x.inputs[0][4],
        to: x.inputs[1],
      },
    })
  },
}

export async function decode(data: string): Promise<DecodeResponse> {
  const decodedData = await decodeEthereumFunctionCall(data)
  const method = decodedData.method

  if (!method) {
    throw new Error("No method found")
  }

  return methods[method](decodedData)
}

export async function decodeTokenByAssetClass(
  type: string,
  data: string,
  method: Method = "sell",
): Promise<DecodeResponse> {
  return await decodeByAssetClass(type, data, method)
}

async function decodeByAssetClass(
  type: string,
  data: string,
  method: Method,
): Promise<DecodeResponse> {
  const tokenId = decoders[type]?.decoder(type, data)
  console.debug("decodeByAssetClass", { type, data, method, tokenId })
  const [item, collection] = await Promise.all([
    await sdk.apis.item.getItemById({
      itemId: `ETHEREUM:${tokenId.collectionId}:${tokenId.tokenId}`,
    }),
    await sdk.apis.collection.getCollectionById({
      collection: `ETHEREUM:${tokenId?.collectionId}`,
    }),
  ])

  return {
    interface: "Item",
    method: method,
    data: {
      ...item,
      collectionData: collection,
    },
  }
}

function decodeTokenIdLazy(type: string, data: string): TokenId {
  const nft =
    "0x0000000000000000000000000000000000000000000000000000000000000020" +
    data.substring(2)
  const ethereum = new EthersEthereum(ethers.Wallet.createRandom())
  const result = ethereum.decodeParameter(decoders[type]?.type, nft)
  return { collectionId: result[0][0], tokenId: result[0][1][0] }
}

function decodeTokenId(type: string, data: string): TokenId {
  const schema = decoders[type]?.type
  const result = ethereum.decodeParameter({ root: { schema } }, data)
  return { collectionId: result[0][0][0], tokenId: result[0][0][1] }
}

interface DecodedFunctionCall1 {
  method: string
  types: string[]
  names: (string | [string, string[]])[]
  inputs: any[]
}

export async function decodeEthereumFunctionCall(
  data: string,
): Promise<DecodedFunctionCall1> {
  for (const fragment of abi) {
    const method = fragment.name

    try {
      const iface = new Interface([fragment as Fragment])
      const inputs = iface.decodeFunctionData(
        FunctionFragment.from(fragment as Fragment),
        data,
      )
      const names =
        fragment.inputs?.map((input) => {
          if (input.type.includes("tuple")) {
            return [input.name, input.components?.map((c) => c.name)]
          }
          return input.name
        }) ?? []
      const types =
        fragment.inputs?.map((input) => {
          if (input.type.includes("tuple")) {
            const componentTypes =
              input.components?.map((c) => c.type).join(",") ?? ""
            return `(${componentTypes})`
          }
          return input.type
        }) ?? []
      // FIXME:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return { method, inputs, names, types }
    } catch (error) {
      console.debug(`${method} is not a match`)
    }
  }

  return { method: "", inputs: [], names: [], types: [] }
}

async function safeTransferFrom(
  x: DecodedFunctionCall,
): Promise<DecodeResponse> {
  return Promise.resolve({
    interface: "SafeTransferFrom",
    method: "safeTransferFrom",
    data: {
      from: x.inputs[0],
      to: x.inputs[1],
      id: (x.inputs[2] as ethers.BigNumber).toString(),
      amount: (x.inputs[3] as ethers.BigNumber).toString(),
      data: x.inputs[4],
    },
  })
}

async function burn(x: DecodedFunctionCall): Promise<DecodeResponse> {
  return Promise.resolve({
    interface: "Burn",
    method: "burn",
    data: {
      tokenId: (x.inputs[0] as ethers.BigNumber).toString(),
    },
  })
}

async function directAcceptBid(
  x: DecodedFunctionCall,
): Promise<DecodeResponse> {
  const nftAssetClass = x.inputs[0][2]
  const nftData = x.inputs[0][3]
  const nft: DecodeResponse = await decodeTokenByAssetClass(
    nftAssetClass,
    nftData,
  )
  return Promise.resolve({
    interface: "DirectAcceptBid",
    method: "directAcceptBid",
    data: {
      bidMaker: x.inputs[0][0],
      bidNftAmount: (x.inputs[0][1] as ethers.BigNumber).toString(),
      nft,
      bidPaymentAmount: (x.inputs[0][4] as ethers.BigNumber).toString(),
      paymentToken: x.inputs[0][5],
      bidSalt: (x.inputs[0][6] as ethers.BigNumber).toString(),
      bidStart: (x.inputs[0][7] as ethers.BigNumber).toString(),
      bidEnd: (x.inputs[0][8] as ethers.BigNumber).toString(),
      bidDataType: x.inputs[0][9],
      bidData: x.inputs[0][10],
      bidSignature: x.inputs[0][11],
      sellOrderPaymentAmount: (x.inputs[0][12] as ethers.BigNumber).toString(),
      sellOrderNftAmount: (x.inputs[0][13] as ethers.BigNumber).toString(),
      sellOrderData: x.inputs[0][14],
    },
  })
}
