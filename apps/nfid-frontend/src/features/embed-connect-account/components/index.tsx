import { useMemo } from "react"

import { IGroupedOptions, IconPngEthereum } from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"
import { E8S } from "@nfid/integration/token/icp"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"
import { useEthBalance } from "frontend/features/fungable-token/eth/hooks/use-eth-balances"

import { ChooseAccount } from "../ui/choose-account/choose-account"

interface IEmbedChooseAccount {
  applicationLogo?: string
  applicationName?: string
  applicationURL?: string
  onConnectionDetails: () => void
  onConnect: (hostname: string, accountId: string) => void
}

export const EmbedChooseAccount = ({
  applicationLogo,
  applicationName,
  applicationURL,
  onConnectionDetails,
  onConnect,
}: IEmbedChooseAccount) => {
  const { address } = useEthAddress()
  const { balance } = useEthBalance()

  const accountsOptions: IGroupedOptions[] = useMemo(() => {
    if (!address) return []

    return [
      {
        label: "Public",
        options: [
          {
            title: "NFID Account 1",
            value: address,
            subTitle: truncateString(address, 6, 4),
            innerTitle: balance?.tokenBalance
              ? `${Number(balance.tokenBalance) / E8S} ETH`
              : "",
            innerSubtitle: balance?.usdBalance,
            icon: IconPngEthereum,
          },
        ],
      },
    ]
  }, [address, balance?.tokenBalance, balance?.usdBalance])

  return (
    <ChooseAccount
      accounts={accountsOptions}
      onConnectionDetails={onConnectionDetails}
      onConnect={() => onConnect("nfid.one", "0")}
      appMeta={{
        logo: applicationLogo,
        name: applicationName,
        url: applicationURL,
      }}
    />
  )
}
