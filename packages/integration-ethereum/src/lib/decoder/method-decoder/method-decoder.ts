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
  | "Mint721"

export type Method =
  | "bulkPurchase"
  | "burn"
  | "cancel"
  | "createToken"
  | "directAcceptBid"
  | "directPurchase"
  | "mintAndTransfer"
  | "safeTransferFrom"
  | "Order"
  | "sell"
  | "Mint721"

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
  data: object
}

export interface MethodDecoder
  extends Decoder<object, string, DecodedFunctionCall, Promise<FunctionCall>> {
  getAbi(): object
  getMethod(): string
  map(decodedFunctionCall: DecodedFunctionCall): Promise<FunctionCall>
}
