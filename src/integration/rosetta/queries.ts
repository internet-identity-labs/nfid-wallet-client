import React from "react"
import useSWR from "swr"

import { getBalance } from "."
import { useAllPrincipals } from "../internet-identity/queries"

export const useBalanceICPAll = () => {
  const { principals } = useAllPrincipals()

  const { data: balanceICPAll, isValidating: isLoading } = useSWR(
    principals ? "balanceICPAll" : null,
    async () => {
      if (!principals) throw new Error("principals required")

      return Promise.all(
        principals.map(async ({ principal, account }) => ({
          principal,
          account,
          balance: await getBalance(principal),
        })),
      )
    },
  )

  // const posBalanceICP = React.useMemo(() => {}, [balanceICPAll])

  return { isLoading, balanceICPAll }
}
