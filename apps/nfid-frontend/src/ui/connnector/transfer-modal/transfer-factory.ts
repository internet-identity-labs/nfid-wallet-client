import { IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { UserNonFungibleToken } from "frontend/features/non-fungable-token/types"

import { StandardizedToken } from "../types"
import { btcTransferConnector } from "./btc/btc-transfer-connector"
import { ethereumERC20TransferConnector } from "./eth/erc20-transfer-connector"
import { ethereumTransferConnector } from "./eth/eth-transfer-connector"
import { ethereumNFTTransferConnector } from "./eth/nft-transfer-connector"
import { dip20TransferConnector } from "./ic/dip20-transfer-connector"
import { icTransferConnector } from "./ic/ic-transfer-connector"
import { icNFTTransferConnector } from "./ic/nft-transfer-connector"
import { polygonERC20TransferConnector } from "./polygon/erc20-transfer-connector"
import { polygonNFTTransferConnector } from "./polygon/nft-transfer-connector"
import { polygonTransferConnector } from "./polygon/polygon-transfer-connector"
import {
  IConnector,
  IGetConnector,
  IUniversalConnector,
  TransferModalType,
} from "./types"
import { concatOptionsWithSameLabel } from "./util/options"

function toMap<T extends StandardizedToken<TokenStandards>>(
  assetViews: T[] | T[],
): Map<TokenStandards, T> {
  const assetViewMap = new Map<TokenStandards, T>()
  assetViews.forEach((assetView) => {
    assetViewMap.set(assetView.getTokenStandard(), assetView)
  })
  return assetViewMap
}

const singleFTConnectors = [
  btcTransferConnector,
  polygonTransferConnector,
  ethereumTransferConnector,
]

const multiFTConnectors = [
  polygonERC20TransferConnector,
  ethereumERC20TransferConnector,
  icTransferConnector,
  dip20TransferConnector,
]

const NFTConnectors = [
  ethereumNFTTransferConnector,
  polygonNFTTransferConnector,
  icNFTTransferConnector,
]

const allConnectors = [
  ...singleFTConnectors,
  ...multiFTConnectors,
  ...NFTConnectors,
]

const ftMappedConnectors = toMap([...singleFTConnectors, ...multiFTConnectors])
const nftMappedConnectors = toMap(NFTConnectors)
export const getConnector = async <T extends TransferModalType>({
  type,
  currency,
  blockchain,
  tokenStandard,
}: IGetConnector<T>): Promise<IConnector<T>> => {
  const mappedConnectors =
    type === TransferModalType.FT ? ftMappedConnectors : nftMappedConnectors

  const allConfigs = (
    await Promise.all(
      allConnectors.map(async (c: IUniversalConnector) => {
        const config = c.getTokenConfig()

        return {
          token: config.tokenStandard,
          blockchain: config.blockchain,
          currencies: await c.getTokenCurrencies(),
          type: config.type,
        }
      }),
    )
  ).filter(
    (c) => type === TransferModalType.FT || c.type === TransferModalType.NFT,
  )

  if (tokenStandard) {
    const neededConfig = allConfigs.find((c) => c.token === tokenStandard)
    return mappedConnectors.get(neededConfig?.token!)! as IConnector<T>
  }

  if (currency) {
    const neededConfig = allConfigs.find((c) => c.currencies.includes(currency))
    return mappedConnectors.get(neededConfig?.token!)! as IConnector<T>
  }

  if (blockchain) {
    const neededConfig = allConfigs.find((c) => c.blockchain === blockchain)
    return mappedConnectors.get(neededConfig?.token!)! as IConnector<T>
  }

  // UNREACHABLE
  throw new Error("No connector found")
}

export const getNativeTokenStandards = (): Array<TokenStandards> => {
  const nativeConnectors = allConnectors.filter(
    (c) => c.getTokenConfig()?.isNativeToken,
  )

  return nativeConnectors.map((c) => c.getTokenStandard())
}

export const getAllTokensOptions = async (): Promise<IGroupedOptions[]> => {
  const ftConnectors = [...singleFTConnectors, ...multiFTConnectors]
  const options = await Promise.all(
    ftConnectors.map(async (c) => await c.getTokensOptions()),
  )
  return concatOptionsWithSameLabel(options)
}

export const getAllNFTOptions = async (): Promise<IGroupedOptions[]> => {
  const options = await Promise.all(
    NFTConnectors.map(async (c) => await c.getNFTOptions()),
  )

  return options.flat()
}

export const getAllNFT = async (): Promise<UserNonFungibleToken[]> => {
  return (
    await Promise.all(NFTConnectors.map(async (c) => await c.getNFTs()))
  ).flat()
}
