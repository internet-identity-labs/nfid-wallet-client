import { Principal } from "@dfinity/principal"
import { principalToAddress } from "ictool"

import { isHex } from "@nfid-frontend/utils"
import { TokenStandards } from "@nfid/integration/token/types"

export const transformToAddress = (
  toAddress: string,
  tokenStandard: TokenStandards,
): string => {
  if (tokenStandard === TokenStandards.ICP) {
    return isHex(toAddress)
      ? toAddress
      : principalToAddress(Principal.fromText(toAddress))
  }

  if (tokenStandard === TokenStandards.DIP20 && isHex(toAddress))
    throw new Error(
      `For tokenStandard ${TokenStandards.DIP20} only pricipals are allowed. Invalid address: ${toAddress}`,
    )

  return toAddress
}
