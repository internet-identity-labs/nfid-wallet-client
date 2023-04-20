import { useMemo } from "react"
import { useErc20 } from "src/features/fungable-token/erc-20/hooks/use-erc-20"

import {
  IconPngEthereum,
  IconSvgBTC,
  IconSvgDfinity,
  IGroupedOptions,
} from "@nfid-frontend/ui"

import { useAllDip20Token } from "frontend/features/fungable-token/dip-20/hooks/use-all-token-meta"

export const useTokenOptions = () => {
  const { token: dip20Tokens } = useAllDip20Token()
  const { erc20 } = useErc20()

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
  }, [dip20Tokens])

  return { tokenOptions }
}
