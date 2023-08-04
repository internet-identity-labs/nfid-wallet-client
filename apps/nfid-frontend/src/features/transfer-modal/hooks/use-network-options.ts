import useSWR from "swr"

import { IGroupOption } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import {
  getConnector,
  getNativeTokenStandards,
} from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"
import { Blockchain } from "frontend/ui/connnector/types"

export const useNetworkOptions = (isVault?: boolean) => {
  const supportedNetworks = getNativeTokenStandards(isVault)

  const { data: networkOptions, ...rest } = useSWR<IGroupOption[]>(
    [supportedNetworks, "networkOptions"],
    ([tokens]) =>
      Promise.all(
        tokens.map(
          async (t: { token: TokenStandards; blockchain: Blockchain }) =>
            (
              await getConnector({
                type: TransferModalType.FT,
                tokenStandard: t.token,
                blockchain: t.blockchain,
              })
            ).getNetworkOption(),
        ),
      ),
  )

  return { data: [{ label: "", options: networkOptions ?? [] }], ...rest }
}
