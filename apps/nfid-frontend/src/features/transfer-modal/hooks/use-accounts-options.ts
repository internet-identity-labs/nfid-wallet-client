import useSWR from "swr"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { getConnector } from "frontend/ui/connnector/transfer-modal/transfer-factory"

export const useAccountsOptions = (token: TokenStandards | null) => {
  const { data: accountsOptions, ...rest } = useSWR<IGroupedOptions[]>(
    [token, "accountsOptions"],
    async ([token]) =>
      (
        await getConnector({ type: "ft", tokenStandard: token })
      ).getAccountsOptions(),
  )

  return { data: accountsOptions ?? [], ...rest }
}
