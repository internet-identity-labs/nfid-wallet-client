import { Cache } from "node-ts-cache"
import { NftErc721EstimateTransactionRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/nft-erc721-populate-transaction.service"
import { NftErc1155EstimateTransactionRequest } from "packages/integration/src/lib/asset/service/populate-transaction-service/nft-erc1155-populate-transaction.service"
import { EstimatedTransaction } from "packages/integration/src/lib/asset/types"

import { IGroupedOptions, IconPngEthereum } from "@nfid-frontend/ui"
import { ethereumGoerliAsset } from "@nfid/integration"
import { TokenStandards } from "@nfid/integration/token/types"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"
import { connectorCache } from "frontend/ui/connnector/cache"
import { NativeToken, Blockchain } from "frontend/ui/connnector/types"

import { EVMTransferConnector } from "../../evm-transfer-connector"
import {
  ITransferConfig,
  ITransferNFTConnector,
  ITransferNFTRequest,
  TokenFee,
  TransferModalType,
} from "../../types"
import { toUserNFT, mapUserNFTDetailsToGroupedOptions } from "../../util/nfts"

export class EthGoerliNFTTransferConnector
  extends EVMTransferConnector<ITransferConfig>
  implements ITransferNFTConnector
{
  @Cache(connectorCache, { ttl: 15 })
  async getNFTs(): Promise<UserNonFungibleToken[]> {
    const identity = await this.getIdentity()
    const address = await this.getAddress()

    const nfts = await ethereumGoerliAsset.getItemsByUser({ identity })
    return nfts.items.map((nft) =>
      toUserNFT(
        nft,
        identity.getPrincipal(),
        this.config.icon,
        address,
        this.config.blockchain,
      ),
    )
  }

  @Cache(connectorCache, { ttl: 15 })
  async getNFTOptions(): Promise<IGroupedOptions[]> {
    const applications = await this.getApplications()
    const nfts = await this.getNFTs()
    return mapUserNFTDetailsToGroupedOptions(nfts, applications)
  }

  @Cache(connectorCache, { ttl: 10 })
  async getFee({
    to,
    tokenId,
    contract,
    standard,
  }: ITransferNFTRequest): Promise<TokenFee> {
    const cacheKey = "nft_" + tokenId + "_transaction"

    const identity = await this.getIdentity()
    const request =
      standard === "ERC721"
        ? new NftErc721EstimateTransactionRequest(
            identity,
            to,
            contract,
            tokenId,
          )
        : new NftErc1155EstimateTransactionRequest(
            identity,
            to,
            1,
            contract,
            tokenId,
          )

    let estimatedTransaction: EstimatedTransaction | undefined = undefined
    try {
      estimatedTransaction = await ethereumGoerliAsset.getEstimatedTransaction(
        request,
      )
    } catch (e: any) {
      throw new Error(e)
    }

    await connectorCache.setItem(cacheKey, estimatedTransaction, {
      ttl: 10,
    })

    return {
      fee: `${estimatedTransaction.fee} ${this.config.feeCurrency}`,
      feeUsd: estimatedTransaction.feeUsd,
    }
  }
}

// export const ethereumGoerliNFTTransferConnector =
//   new EthGoerliNFTTransferConnector({
//     icon: IconPngEthereum,
//     tokenStandard: TokenStandards.ETH,
//     blockchain: Blockchain.ETHEREUM_GOERLI,
//     feeCurrency: NativeToken.ETH,
//     addressPlaceholder: "Recipient ETH address",
//     type: TransferModalType.NFT,
//     assetService: ethereumGoerliAsset,
//     duration: "10 min",
//   })
