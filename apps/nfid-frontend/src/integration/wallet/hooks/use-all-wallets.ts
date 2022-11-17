import { getBalance } from "@nfid/integration"
import useSWR from "swr"

import { useApplicationsMeta } from "frontend/integration/identity-manager/queries"
import { useAllPrincipals } from "frontend/integration/internet-identity/queries"
import { GetWalletName } from "frontend/ui/pages/new-profile/nfts/util"
import { sortAlphabetic, keepStaticOrder } from "frontend/ui/utils/sorting"

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
        .then((wallets) =>
          wallets.sort(sortAlphabetic(({ label }) => label ?? "")),
        )
        .then(keepStaticOrder(({ label }) => label ?? "", ["NFID", "NNS"]))
    },
    { dedupingInterval: 30_000, refreshInterval: 60_000 },
  )

  return { wallets, isLoadingWallets }
}
