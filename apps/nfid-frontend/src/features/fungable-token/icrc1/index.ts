import type { Principal } from "@dfinity/principal"
import {
  ICRC1Metadata,
  getICRC1DataForUser,
} from "packages/integration/src/lib/token/icrc1"
import useSWR from "swr"

import { getLambdaCredentials } from "frontend/integration/lambda/util/util"

export const useAllICRC1Token = () => {
  const { data: token, isLoading: isIcrc1Loading } = useSWR(
    "getICRC1Data",
    async () => {
      const { rootPrincipalId, publicKey } = await getLambdaCredentials()
      const result = await getICRC1DataForUser(rootPrincipalId!, publicKey)

      return result.map((item) => ({
        ...item,
        price: item.priceInUsd,
        feeCurrency: item.symbol,
        toPresentation: (value = BigInt(0)) => {
          return Number(value) / Number(BigInt(10 ** item.decimals))
        },
        transformAmount: (value: string) =>
          Number(parseFloat(value) * 10 ** item.decimals),
      })) as ICRC1Metadata[]
    },
  )

  return { token, isIcrc1Loading }
}
