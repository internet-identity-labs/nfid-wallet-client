import { AnonymousIdentity, HttpAgent } from "@dfinity/agent"
import { icpSwapPropertiesService } from "src/integration/nft/impl/icpswap/properties/properties-service"
import { icpswapTransactionMapper } from "src/integration/nft/impl/icpswap/transaction/icpswap-transaction-mapper"
import { NFTDetailsImpl, NftImpl } from "src/integration/nft/impl/nft-abstract"
import { NFTDetails, TransactionRecord } from "src/integration/nft/nft"

import {
  actorBuilder,
  agentBaseConfig,
  hasOwnProperty,
} from "@nfid/integration"

import { AssetPreview, DisplayFormat, TokenProperties } from "../nft-types"
import { idlFactory } from "./idl/SwapNFT"
import {
  _SERVICE as IcpSwapCanister,
  CanisterInfo,
  IcsMetadata,
  NFTResult,
  ResponseResult_3,
  ResponseResult_5,
} from "./idl/SwapNFT.d"

export class NftIcpSwap extends NftImpl {
  private icsMetadata: IcsMetadata | undefined

  async getAssetPreviewAsync(): Promise<AssetPreview> {
    return await this.getIcsMetadata().then((icsMetadata) => {
      return {
        url: icsMetadata.filePath,
        format: toFormat(icsMetadata.fileType),
      }
    })
  }

  getTokenMarketPlaceLink(): string {
    return `https://app.icpswap.com/marketplace/NFT/view/${this.getCollectionId()}/${this.getTokenNumber()}`
  }

  getCollectionMarketPlaceLink(): string {
    return `https://app.icpswap.com/marketplace/NFT/${this.getCollectionId()}`
  }

  async getDetails(): Promise<NFTDetails> {
    const canisterActor = actorBuilder<IcpSwapCanister>(
      this.getCollectionId(),
      idlFactory,
    )
    const icsMetadata: ResponseResult_3 = await canisterActor.icsMetadata(
      this.getTokenNumber(),
    )
    const nftResult: NFTResult = await canisterActor.canisterInfo()
    if (hasOwnProperty(icsMetadata, "err")) {
      throw new Error(icsMetadata.err as string)
    }
    if (hasOwnProperty(nftResult, "err")) {
      throw new Error(nftResult.err as string)
    }
    this.icsMetadata = icsMetadata.ok
    return new NftIcpSwapDetails(
      icsMetadata.ok,
      nftResult.ok,
      this.getTokenId(),
    )
  }

  private async getIcsMetadata(): Promise<IcsMetadata> {
    if (this.icsMetadata === undefined) {
      const identity = new AnonymousIdentity()
      const canisterActor = actorBuilder<IcpSwapCanister>(
        this.getCollectionId(),
        idlFactory,
        {
          agent: new HttpAgent({ ...agentBaseConfig, identity }),
        },
      )
      const icsMetadata: ResponseResult_3 = await canisterActor.icsMetadata(
        this.getTokenNumber(),
      )
      if (hasOwnProperty(icsMetadata, "err")) {
        throw new Error(icsMetadata.err as string)
      }
      this.icsMetadata = icsMetadata.ok
    }
    return this.icsMetadata
  }
}

class NftIcpSwapDetails extends NFTDetailsImpl {
  private readonly icsMetadata: IcsMetadata
  private readonly canisterInfo: CanisterInfo
  private readonly tokenId: string

  constructor(
    icsMetadata: IcsMetadata,
    canisterInfo: CanisterInfo,
    tokenId: string,
  ) {
    super()
    this.icsMetadata = icsMetadata
    this.canisterInfo = canisterInfo
    this.tokenId = tokenId
  }

  getAbout(): string {
    return this.icsMetadata.introduction
  }

  async getTransactions(
    from: number,
    to: number,
  ): Promise<{ activity: Array<TransactionRecord>; isLastPage: boolean }> {
    const canisterActor = actorBuilder<IcpSwapCanister>(
      this.icsMetadata.cId,
      idlFactory,
    )
    const response: ResponseResult_5 = await canisterActor.findTxRecord(
      this.tokenId,
      BigInt(from),
      BigInt(to),
    )
    if (hasOwnProperty(response, "err")) {
      throw new Error(response.err as string)
    }

    const activity: Array<TransactionRecord> = response.ok.content
      .map(icpswapTransactionMapper.toTransactionRecord)
      .filter((tx): tx is TransactionRecord => tx !== null)
    return {
      activity,
      isLastPage: response.ok.totalElements <= to,
    }
  }

  async getAssetFullSize(): Promise<AssetPreview> {
    const format: DisplayFormat = toFormat(this.icsMetadata.fileType)
    return {
      url: this.icsMetadata.filePath,
      format,
    }
  }

  async getProperties(): Promise<TokenProperties> {
    return icpSwapPropertiesService.getProperties(this.icsMetadata)
  }
}

function toFormat(file: string): DisplayFormat {
  //TODO extend when we come across other file types
  switch (file) {
    case "video":
      return "video"
    case "image":
      return "img"
    default:
      console.warn("Unknown ICPSWAP display format: " + file)
      return "img"
  }
}
