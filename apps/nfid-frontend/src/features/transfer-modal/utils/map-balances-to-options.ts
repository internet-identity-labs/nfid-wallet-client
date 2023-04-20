import { Principal } from "@dfinity/principal"
import { TokenBalanceSheet } from "packages/integration/src/lib/asset/types"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { groupArrayByField, truncateString } from "@nfid-frontend/utils"
import { toPresentation } from "@nfid/integration/token/icp"

import { toUSD } from "frontend/features/fungable-token/accumulate-app-account-balances"
import { IRate } from "frontend/features/fungable-token/eth/hooks/use-eth-exchange-rate"
import { TokenBalance } from "frontend/features/fungable-token/fetch-balances"

export const mapAccountBalancesToOptions = (
  wallets: {
    principal: Principal
    principalId: string
    balance: TokenBalance
    label: string
    accountId: string
    domain: string
    isVaultWallet?: boolean
    address?: string
    vaultId?: bigint
    vaultName?: string
    ethAddress?: string
    btcAddress?: string
  }[],
  selectedToken: string,
  rates: IRate,
  erc20: TokenBalanceSheet[],
) => {
  if (!wallets) return []

  if (selectedToken === "ETH")
    return [
      {
        label: "Public",
        options: [
          {
            title: "NFID Account 1",
            value: wallets[0]?.ethAddress,
            subTitle: truncateString(wallets[0]?.ethAddress ?? "", 10),
            innerTitle: `${toPresentation(
              wallets[0]?.balance[selectedToken],
            )} ${selectedToken}`,
            innerSubtitle: toUSD(
              toPresentation(wallets[0]?.balance[selectedToken]),
              rates[selectedToken],
            ),
          },
        ],
      },
    ] as IGroupedOptions[]

  if (selectedToken === "BTC")
    return [
      {
        label: "Public",
        options: [
          {
            title: "NFID Account 1",
            value: wallets[0]?.btcAddress,
            subTitle: truncateString(wallets[0]?.btcAddress ?? "", 10),
            innerTitle: `${toPresentation(
              wallets[0]?.balance[selectedToken],
            )} ${selectedToken}`,
            innerSubtitle: toUSD(
              toPresentation(wallets[0]?.balance[selectedToken]),
              rates[selectedToken],
            ),
          },
        ],
      },
    ] as IGroupedOptions[]

  const erc20token = erc20.find((l) => l.token === selectedToken)
  if (erc20token) {
    return [
      {
        label: "Public",
        options: [
          {
            title: "NFID Account 1",
            value: wallets[0]?.ethAddress,
            subTitle: truncateString(wallets[0]?.ethAddress ?? "", 10),
            innerTitle: `${toPresentation(
              erc20token.tokenBalance,
            )} ${selectedToken}`,
            innerSubtitle: erc20token.usdBalance,
          },
        ],
      },
    ] as IGroupedOptions[]
  }

  const formattedOptions = wallets.map((wallet) => ({
    title: wallet.label ?? "",
    value: wallet.isVaultWallet
      ? wallet.address ?? ""
      : wallet.principal?.toText(),
    subTitle: truncateString(wallet.principalId, 5),
    innerTitle: `${toPresentation(
      wallet.balance[selectedToken],
    )} ${selectedToken}`,
    innerSubtitle: toUSD(
      toPresentation(wallet.balance[selectedToken]),
      rates[selectedToken],
    ),
    isVaultWallet: wallet.isVaultWallet,
    vaultId: wallet.vaultId,
    vaultName: wallet.vaultName,
  }))

  const publicWallets = formattedOptions.filter((w) => !w.isVaultWallet)
  const vaultWallets = formattedOptions.filter((w) => w.isVaultWallet)
  const vaultGroups =
    selectedToken === "ICP"
      ? groupArrayByField(vaultWallets, "vaultId").map((group) => ({
          label: group[0]?.vaultName,
          options: group,
        }))
      : []

  return [
    {
      label: "Public",
      options: publicWallets,
    },
    ...vaultGroups,
  ] as IGroupedOptions[]
}
