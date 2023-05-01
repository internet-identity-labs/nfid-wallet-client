import { useMemo } from "react"
import { useErc20Polygon } from "src/features/fungable-token/erc-20/hooks/use-erc-20-polygon"

import {
  IconPngEthereum,
  IconSvgBTC,
  IconSvgDfinity,
  IGroupedOptions,
} from "@nfid-frontend/ui"

import { useAllDip20Token } from "frontend/features/fungable-token/dip-20/hooks/use-all-token-meta"
import { useErc20 } from "frontend/features/fungable-token/erc-20/hooks/use-erc-20"

export const useTokenOptions = () => {
  const { token: dip20Tokens } = useAllDip20Token()
  const { erc20 } = useErc20()
  const { erc20: erc20Polygon } = useErc20Polygon()

  const tokenOptions: IGroupedOptions[] = useMemo(() => {
    return [
      {
        label: "Internet Computer",
        options: [
          {
            icon: IconSvgDfinity,
            title: "ICP",
            subTitle: "Internet Computer",
            value: "ICP",
          },
        ].concat(
          dip20Tokens?.map((token) => ({
            icon: token.logo,
            title: token.symbol,
            subTitle: token.name,
            value: token.symbol,
          })) ?? [],
        ),
      },
      {
        label: "Ethereum",
        options: [
          {
            icon: IconPngEthereum,
            title: "ETH",
            subTitle: "Ethereum",
            value: "ETH",
          },
        ].concat(
          erc20?.map((token) => ({
            icon: token.icon,
            title: token.token,
            subTitle: token.label,
            value: token.token,
          })) ?? [],
        ),
      },
      {
        label: "Polygon",
        options: [
          {
            icon: IconSvgBTC,
            title: "MATIC",
            subTitle: "Polygon",
            value: "MATIC",
          },
        ].concat(
          erc20Polygon?.map((token) => ({
            icon: token.icon,
            title: token.token,
            subTitle: token.label,
            value: token.token,
          })) ?? [],
        ),
      },
      {
        label: "Bitcoin",
        options: [
          {
            icon: IconSvgBTC,
            title: "BTC",
            subTitle: "Bitcoin",
            value: "BTC",
          },
        ],
      },
    ] as IGroupedOptions[]
  }, [dip20Tokens, erc20, erc20Polygon])

  return { tokenOptions }
}
