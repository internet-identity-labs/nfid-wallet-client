import { Principal } from "@dfinity/principal"

import { ftService } from "frontend/integration/ft/ft-service"
import {getUserIdData} from "../../../../integration/src/lib/cache/cache";

//TODO move to authState
export const getUserPrincipalId = async (): Promise<{
  userPrincipal: string
  publicKey: string
}> => {
  const pair = await getUserIdData()
  return {
    userPrincipal: pair.userId,
    publicKey: pair.publicKey,
  }
}

export const fetchAllTokens = async () => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  const data = await ftService.getAllUserTokens(
    userPrincipal,
    Principal.fromText(publicKey),
    1,
    999,
  )
  return data.items
}

export const fetchTokenByAddress = async (address: string) => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  const data = await ftService.getUserTokenByAddress(
    userPrincipal,
    Principal.fromText(publicKey),
    address,
    1,
    999,
  )
  return data
}

export const fetchFilteredTokens = async (searchQuery: string) => {
  const { userPrincipal } = await getUserPrincipalId()
  return await ftService.getAllFTokens(userPrincipal, searchQuery)
}

export const getFullUsdValue = async () => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  return await ftService.getTotalUSDBalance(
    userPrincipal,
    Principal.fromText(publicKey),
  )
}
