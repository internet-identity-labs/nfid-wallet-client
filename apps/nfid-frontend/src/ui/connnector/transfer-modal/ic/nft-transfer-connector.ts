import { principalToAddress } from "ictool"
import { EstimatedTransaction } from "packages/integration/src/lib/asset/types"

import {
  IGroupOption,
  IGroupedOptions,
  IconPngEthereum,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import {
  PrincipalAccount,
  ethereumAsset,
  getWalletName,
} from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { principalTokens } from "frontend/integration/entrepot"
import { keepStaticOrder, sortAlphabetic } from "frontend/ui/utils/sorting"

import { connectorCache } from "../../cache"
import { Blockchain } from "../../types"
import {
  ITransferNFTConnector,
  ITransferNFTModalConfig,
  ITransferNFTRequest,
  TokenFee,
} from "../types"
import {
  mapUserNFTDetailsToGroupedOptions,
  userNFTDetailsToNFT,
} from "../util/nfts"
import { ICMTransferConnector } from "./icm-transfer-connector"

export class IcNFTTransferConnector
  extends ICMTransferConnector<ITransferNFTModalConfig>
  implements ITransferNFTConnector
{
  async getNFTs(): Promise<UserNonFungibleToken[]> {
    const allPrincipals = await this.getAllPrincipals(false)
    const allNFTs = await principalTokens(allPrincipals)
    return userNFTDetailsToNFT(allNFTs)
  }

  async getNFTOptions(): Promise<IGroupedOptions[]> {
    const applications = await this.getApplications()
    const allNFTs = await this.getNFTs()
    return mapUserNFTDetailsToGroupedOptions(allNFTs, applications)
  }

  async getFee({
    to,
    tokenId,
    contract,
  }: ITransferNFTRequest): Promise<TokenFee> {
    const cacheKey = "nft_" + tokenId + "_transaction"

    const identity = await this.getIdentity()
    const request = {
      identity,
      to,
      contract,
      tokenId,
    }
    let estimatedTransaction: EstimatedTransaction | undefined = undefined
    try {
      estimatedTransaction = await ethereumAsset.getEstimatedTransaction(
        request,
      )
    } catch (e: any) {
      throw new Error(e?.message)
    }

    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return {
      fee: estimatedTransaction.fee,
      feeUsd: estimatedTransaction.feeUsd,
    }
  }
}

export const icNFTTransferConnector = new IcNFTTransferConnector({
  icon: IconPngEthereum,
  tokenStandard: TokenStandards.ICP,
  blockchain: Blockchain.ETHEREUM,
  addressPlaceholder: "Recipient IC address",
  supportNFT: true,
  type: "nft",
})
