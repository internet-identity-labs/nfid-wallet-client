import useSWR from "swr"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { getConnector } from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

export const useAccountsOptions = (
  token: TokenStandards,
  blockchain: Blockchain,
) => {
  const { data: accountsOptions, ...rest } = useSWR<IGroupedOptions[]>(
    [token, "accountsOptions"],
    async ([token]) =>
      (
        await getConnector({
          type: TransferModalType.FT,
          tokenStandard: token,
          blockchain: blockchain,
        })
      ).getAccountsOptions(),
  )

  return { data: accountsOptions ?? [], ...rest }
}
