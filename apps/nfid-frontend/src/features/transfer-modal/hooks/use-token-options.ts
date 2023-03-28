import { useMemo } from "react"

import {
  IconPngEthereum,
  IconSvgDfinity,
  IGroupedOptions,
} from "@nfid-frontend/ui"

import { useAllDip20Token } from "frontend/features/fungable-token/dip-20/hooks/use-all-token-meta"

export const useTokenOptions = () => {
  const { token: dip20Tokens } = useAllDip20Token()

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
        ],
      },
    ] as IGroupedOptions[]
  }, [dip20Tokens])

  return { tokenOptions }
}
