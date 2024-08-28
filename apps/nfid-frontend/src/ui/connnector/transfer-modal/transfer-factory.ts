import { IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { Blockchain } from "../types"
import { icTransferConnector } from "./ic/ic-transfer-connector"
import { icrc1TransferConnector } from "./ic/icrc1-transfer-connector"
import {
  IConnector,
  IGetConnector,
  ITransferConfig,
  ITransferFTConnector,
  IUniversalConnector,
  TransferModalType,
} from "./types"
import { concatOptionsWithSameLabel } from "./util/options"

function toMap<T extends { getTokenConfig: () => ITransferConfig }>(
  assetViews: T[] | T[],
): Map<string, T> {
  const assetViewMap = new Map<string, T>()
  assetViews.forEach((assetView) => {
    const config = assetView.getTokenConfig()
    assetViewMap.set(`${config.tokenStandard}&${config.blockchain}`, assetView)
  })
  return assetViewMap
}

const singleFTConnectors: ITransferFTConnector[] = []

const multiFTConnectors = [icTransferConnector, icrc1TransferConnector]

const allConnectors = [...singleFTConnectors, ...multiFTConnectors]

const ftMappedConnectors = toMap([...singleFTConnectors, ...multiFTConnectors])
export const getConnector = async <T extends TransferModalType>({
  type,
  currency,
  blockchain,
  tokenStandard,
}: IGetConnector<T>): Promise<IConnector<T>> => {
  const mappedConnectors =
    type === TransferModalType.FT ? ftMappedConnectors : ftMappedConnectors

  const allConfigs = (
    await Promise.all(
      allConnectors.map(async (c: IUniversalConnector) => {
        try {
          const config = c.getTokenConfig()

          return {
            token: config.tokenStandard,
            blockchain: config.blockchain,
            currencies: await c.getTokenCurrencies(),
            type: config.type,
          }
        } catch (e) {
          // FIXME: handle case when request fails
          console.error("getConnector", e)
          return null
        }
      }),
    )
  ).filter(
    (c) => type === TransferModalType.FT || c?.type === TransferModalType.NFT,
  )

  if (tokenStandard) {
    const neededConfig = allConfigs.find(
      (c) => c?.token === tokenStandard && c?.blockchain === blockchain,
    )

    return mappedConnectors.get(
      `${neededConfig?.token}&${neededConfig?.blockchain}`,
    )! as IConnector<T>
  }

  if (currency) {
    const neededConfig = allConfigs.find(
      (c) => c?.currencies.includes(currency) && c.blockchain === blockchain,
    )

    return mappedConnectors.get(
      `${neededConfig?.token}&${neededConfig?.blockchain}`,
    )! as IConnector<T>
  }

  if (blockchain) {
    const neededConfig = allConfigs.find((c) => c?.blockchain === blockchain)

    return mappedConnectors.get(
      `${neededConfig?.token}&${neededConfig?.blockchain}`,
    )! as IConnector<T>
  }

  // UNREACHABLE
  throw new Error("No connector found")
}

export const getNativeTokenStandards = (
  isVault?: boolean,
): Array<{
  token: TokenStandards
  blockchain: Blockchain
}> => {
  const nativeConnectors = isVault
    ? [icTransferConnector]
    : allConnectors.filter((c) => c.getTokenConfig()?.isNativeToken)

  return nativeConnectors.map((c) => ({
    token: c.getTokenStandard(),
    blockchain: c.getTokenConfig()?.blockchain,
  }))
}

export const getAllTokensOptions = async (
  isVault?: boolean,
): Promise<IGroupedOptions[]> => {
  if (isVault) return [await icTransferConnector.getTokensOptions()]
  const ftConnectors = [...singleFTConnectors, ...multiFTConnectors]
  const options = await Promise.all(
    ftConnectors.map(async (c) => {
      try {
        return await c.getTokensOptions()
      } catch (e) {
        // FIXME: handle case when request fails
        console.error("getAllTokensOptions", e)
        return undefined
      }
    }),
  )

  return concatOptionsWithSameLabel(
    options.filter((o) => !!o) as IGroupedOptions[],
  )
}
