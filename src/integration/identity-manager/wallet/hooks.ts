import useSWR from "swr"

import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { getBalance } from "frontend/integration/rosetta"
import { GetWalletName } from "frontend/ui/pages/new-profile/nfts/util"

import { useApplicationsMeta } from "../queries"

export const useAllWallets = () => {
  const { principals } = useAllPrincipals()
  const applications = useApplicationsMeta()

  const { data: wallets, isValidating: isLoadingWallets } = useSWR(
    principals ? "allWallets" : null,
    async () => {
      if (!principals) throw new Error("missing req")
      return await Promise.all(
        principals.map(async ({ principal, account }) => ({
          label: GetWalletName(
            applications.applicationsMeta ?? [],
            account.domain,
            account.accountId,
          ),
          principal: principal,
          accountId: account.accountId,
          domain: account.domain,
          balance: await getBalance(principal),
        })),
      )
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { wallets, isLoadingWallets }
}
