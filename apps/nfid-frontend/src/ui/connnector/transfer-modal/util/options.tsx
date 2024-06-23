import { IGroupedOptions } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"

export const makeRootAccountGroupedOptions = (
  address: string,
  balance: string,
  usdBalance: string | undefined,
  currency: string,
): IGroupedOptions => ({
  label: "NFID",
  options: [
    {
      title: "NFID",
      badgeText: "WALLET",
      subTitle: truncateString(address, 6, 4),
      value: address,
      innerTitle: balance + " " + currency,
      innerSubtitle: usdBalance,
    },
  ],
})

export const concatOptionsWithSameLabel = (options: IGroupedOptions[]) => {
  const mergedTokens = options.reduce<{
    [label: string]: IGroupedOptions
  }>((acc, item) => {
    if (!acc[item.label]) {
      acc[item.label] = item
    } else {
      acc[item.label].options = acc[item.label].options.concat(item.options)
    }
    return acc
  }, {})

  return Object.values(mergedTokens)
}
