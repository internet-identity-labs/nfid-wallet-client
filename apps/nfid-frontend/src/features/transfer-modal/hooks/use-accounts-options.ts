import useSWR from "swr"

import { IGroupedOptions } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import { getConnector } from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

export const useAccountsOptions = (
  token: TokenStandards,
  blockchain: Blockchain,
  isVaultWallets?: boolean,
) => {
  const { data: accountsOptions, ...rest } = useSWR<IGroupedOptions[]>(
    [token, blockchain, "accountsOptions"],
    async ([token, blockchain]) =>
      (
        await getConnector({
          type: TransferModalType.FT,
          tokenStandard: token,
          blockchain: blockchain,
        })
      ).getAccountsOptions({ isVault: true }),
  )

  return { data: accountsOptions ?? [], ...rest }
}
