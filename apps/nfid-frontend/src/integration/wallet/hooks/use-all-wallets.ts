import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"
import React from "react"
import { useBtcAddress } from "src/features/fungable-token/btc/hooks/use-btc-address"

import { getWalletName } from "@nfid/integration"

import { useEthAddress } from "frontend/features/fungable-token/eth/hooks/use-eth-address"
import { TokenBalance } from "frontend/features/fungable-token/fetch-balances"
import { useUserBalances } from "frontend/features/fungable-token/icp/hooks/use-user-balances"
import { useAllVaultsWallets } from "frontend/features/vaults/hooks/use-vaults-wallets-balances"
import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { sortAlphabetic, keepStaticOrder } from "frontend/ui/utils/sorting"

export type Wallet = {
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
}

export const useAllWallets = () => {
  const { balances, isLoading } = useUserBalances()
  const { balances: vaultsBalances, isLoading: isAllWalletsLoading } =
    useAllVaultsWallets()
  const { address } = useEthAddress()
  const { btcAddress } = useBtcAddress()

  const applications = useApplicationsMeta()

  const wallets = React.useMemo(() => {
    if (!balances || !vaultsBalances) return []

    const wallets = balances
      ?.map(({ principal, account, ...rest }) => ({
        label: getWalletName(
          applications.applicationsMeta ?? [],
          account.domain,
          account.accountId,
        ),
        accountId: account.accountId,
        domain: account.domain,
        principal,
        address: principalToAddress(principal),
        ethAddress: address,
        btcAddress: btcAddress,
        ...rest,
      }))
      .sort(sortAlphabetic(({ label }) => label ?? ""))
      .concat(
        vaultsBalances?.map(({ principal, account, address, ...rest }) => ({
          label: account.label,
          accountId: account.accountId,
          domain: account.domain,
          principal,
          address: address ?? account.accountId,
          isVaultWallet: true,
          ethAddress: address,
          btcAddress: btcAddress,
          ...rest,
        })) ?? [],
      )
    return keepStaticOrder<Wallet>(
      ({ label }) => label ?? "",
      ["NFID", "NNS"],
    )(wallets || [])
  }, [
    address,
    applications.applicationsMeta,
    balances,
    vaultsBalances,
    btcAddress,
  ])

  return { wallets, isLoading: isLoading || isAllWalletsLoading }
}
