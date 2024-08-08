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
  isRootOnly?: boolean,
) => {
  const { data: accountsOptions, ...rest } = useSWR<IGroupedOptions[]>(
    [token, blockchain, isVaultWallets, "accountsOptions"],
    async ([token, blockchain, isVault]) =>
      (
        await getConnector({
          type: TransferModalType.FT,
          tokenStandard: token,
          blockchain: blockchain as Blockchain,
        })
      ).getAccountsOptions({ isVault: isVault as boolean, isRootOnly }),
  )

  return { data: accountsOptions ?? [], ...rest }
}
