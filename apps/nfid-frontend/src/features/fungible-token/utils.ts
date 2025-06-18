import { Principal } from "@dfinity/principal"

import { authState } from "@nfid/integration"
import { BTC_NATIVE_ID } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"
import { NFT } from "frontend/integration/nft/nft"

//TODO move to authState
export const getUserPrincipalId = async (): Promise<{
  userPrincipal: string
  publicKey: string
}> => {
  const pair = authState.getUserIdData()
  return {
    userPrincipal: pair.userId,
    publicKey: pair.publicKey,
  }
}

export const initTokens = async (
  tokens: FT[],
  isBtcAddressLoading: boolean,
) => {
  const { publicKey } = await getUserPrincipalId()

  return await Promise.all(
    tokens.map((token) => {
      if (token.isInited()) return token
      if (token.getTokenAddress() === BTC_NATIVE_ID && isBtcAddressLoading) {
        return token
      }
      return token.init(Principal.fromText(publicKey))
    }),
  )
}

export const fetchTokens = async () => {
  const { userPrincipal } = await getUserPrincipalId()
  return await ftService.getTokens(userPrincipal)
}

export const filterNotActiveNotZeroBalancesTokens = async (
  allTokens: Array<FT>,
) => {
  const { publicKey } = await getUserPrincipalId()
  return await ftService.filterNotActiveNotZeroBalancesTokens(
    allTokens,
    Principal.fromText(publicKey),
  )
}

export const getFullUsdValue = async (nfts: NFT[] | undefined, ft: FT[]) => {
  const { publicKey } = authState.getUserIdData()
  return await ftService.getTotalUSDBalance(
    Principal.fromText(publicKey),
    nfts,
    ft,
  )
}
