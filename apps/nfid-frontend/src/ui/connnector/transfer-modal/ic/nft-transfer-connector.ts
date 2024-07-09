import { Cache } from "node-ts-cache"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { principalTokens } from "frontend/integration/entrepot"

import { connectorCache } from "../../cache"
import { Blockchain, NativeToken } from "../../types"
import {
  ITransferConfig,
  ITransferNFTConnector,
  TransferModalType,
} from "../types"
import {
  mapUserNFTDetailsToGroupedOptions,
  userNFTDetailsToNFT,
} from "../util/nfts"
import { ICMTransferConnector } from "./icm-transfer-connector"

export class IcNFTTransferConnector
  extends ICMTransferConnector<ITransferConfig>
  implements ITransferNFTConnector
{
  @Cache(connectorCache, { ttl: 15 })
  async getNFTs(): Promise<UserNonFungibleToken[]> {
    const allPrincipals = await this.getAllPrincipals(false)
    const allNFTs = await principalTokens(allPrincipals)
    return userNFTDetailsToNFT(allNFTs)
  }

  @Cache(connectorCache, { ttl: 15 })
  async getNFTOptions(): Promise<IGroupedOptions[]> {
    const applications = await this.getApplications()
    const allNFTs = await this.getNFTs()
    return mapUserNFTDetailsToGroupedOptions(allNFTs, applications)
  }

  getFee(): Promise<bigint> {
    return Promise.resolve(BigInt(0))
  }
}

export const icNFTTransferConnector = new IcNFTTransferConnector({
  icon: "",
  tokenStandard: TokenStandards.ICP,
  blockchain: Blockchain.IC,
  addressPlaceholder: "Recipient IC address",
  type: TransferModalType.NFT,
  feeCurrency: NativeToken.ICP,
  duration: "10 sec",
})
