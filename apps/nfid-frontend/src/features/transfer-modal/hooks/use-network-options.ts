import useSWR from "swr"

import { IGroupOption } from "@nfid-frontend/ui"
import { TokenStandards } from "@nfid/integration/token/types"

import {
  getConnector,
  getNativeTokenStandards,
} from "frontend/ui/connnector/transfer-modal/transfer-factory"
import { TransferModalType } from "frontend/ui/connnector/transfer-modal/types"

export const useNetworkOptions = () => {
  const supportedNetworks = getNativeTokenStandards()

  const { data: networkOptions, ...rest } = useSWR<IGroupOption[]>(
    [supportedNetworks, "networkOptions"],
    ([tokens]) =>
      Promise.all(
        tokens.map(async (token: TokenStandards) =>
          (
            await getConnector({
              type: TransferModalType.FT,
              tokenStandard: token,
            })
          ).getNetworkOption(),
        ),
      ),
  )

  return { data: [{ label: "", options: networkOptions ?? [] }], ...rest }
}
