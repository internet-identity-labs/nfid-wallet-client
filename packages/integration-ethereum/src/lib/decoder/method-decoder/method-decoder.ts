import {
  Collection as CollectionRarible,
  Item as ItemRarible,
} from "@rarible/api-client"

import { Decoder } from "../../decoder/decoder"

export type Interface =
  | "BatchBuyRequest"
  | "Burn"
  | "CancelOrder"
  | "CollectionRequest"
  | "DirectAcceptBid"
  | "Item"
  | "MintRequest"
  | "SafeTransferFrom"
  | "MintLazy721"
  | "MintLazy1155"
  | "PersonalSign"

export type Method =
  | "bulkPurchase"
  | "burn"
  | "cancel"
  | "createToken"
  | "directAcceptBid"
  | "directPurchase"
  | "mintAndTransfer"
  | "safeTransferFrom"
  | "SellOrder"
  | "BidOrder"
  | "Mint721"
  | "Mint1155"
  | "sell"
  | "personalSign"

export type Item = ItemRarible & { collectionData: CollectionRarible }

export type DecodedFunctionCall = {
  method: string
  types: string[]
  names: (string | [string, string[]])[]
  inputs: any[]
}

export type FunctionCall = {
  interface: Interface
  method: Method
  data: any
}

export interface MethodDecoder
  extends Decoder<object, string, DecodedFunctionCall, Promise<FunctionCall>> {
  getAbi(): object
  getMethod(): string
  map(decodedFunctionCall: DecodedFunctionCall): Promise<FunctionCall>
}
