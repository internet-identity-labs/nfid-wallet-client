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

export type Item = ItemRarible & { collectionData: CollectionRarible }

export type DecodedFunctionCall = {
  method: string
  types: string[]
  names: (string | [string, string[]])[]
  inputs: any[]
}

export type FunctionCall = {
  interface: Interface
  method: string
  data: object
}

export interface MethodDecoder
  extends Decoder<object, string, DecodedFunctionCall, Promise<FunctionCall>> {
  getAbi(): object
  getMethod(): string
  map(decodedFunctionCall: DecodedFunctionCall): Promise<FunctionCall>
}
