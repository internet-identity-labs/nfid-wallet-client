import {
  ICRC1Metadata,
  getICRC1DataForUser,
} from "packages/integration/src/lib/token/icrc1"
import useSWR from "swr"

import { toPresentationIcrc1 } from "@nfid/integration/token/utils"

import { getLambdaCredentials } from "frontend/integration/lambda/util/util"

export const useAllICRC1Token = () => {
  const { data: token, isLoading: isIcrc1Loading } = useSWR(
    "getICRC1Data",
    async () => {
      const { rootPrincipalId, publicKey } = await getLambdaCredentials()
      const result = await getICRC1DataForUser(rootPrincipalId!, publicKey)

      return result.map((item) => ({
        ...item,
        price:
          item.priceInUsd === 0 || (item.priceInUsd && item.priceInUsd < 0.01)
            ? "0.00"
            : item.priceInUsd,
        feeCurrency: item.symbol,
        toPresentation: toPresentationIcrc1,
        transformAmount: (value: string) =>
          Number(parseFloat(value) * 10 ** item.decimals),
      })) as ICRC1Metadata[]
    },
  )

  return { token, isIcrc1Loading }
}
