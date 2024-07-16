import { Decoder } from "../../decoder/decoder"

export type AssetId = {
  collectionId: string
  tokenId: string
}

export type AssetDecoder = Decoder<object, string, string, AssetId>
