import { Principal } from "@dfinity/principal"

import { ftService } from "frontend/integration/ft/ft-service"

import { getUserIdData } from "../../../../integration/src/lib/cache/cache"

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

export const fetchActiveTokens = async () => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  const data = await ftService.getAllUserTokens(
    userPrincipal,
    Principal.fromText(publicKey),
  )
  return data.items
}

export const fetchActiveTokenByAddress = async (address: string) => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  const data = await ftService.getUserTokenByAddress(
    userPrincipal,
    Principal.fromText(publicKey),
    address,
  )

  return data
}

export const fetchAllTokens = async (searchQuery: string) => {
  const { userPrincipal } = await getUserPrincipalId()
  return await ftService.getAllTokens(userPrincipal, searchQuery)
}

export const fetchAllTokenByAddress = async (address: string) => {
  const { userPrincipal } = await getUserPrincipalId()
  const data = await ftService.getAllTokenByAddress(
    userPrincipal,
    undefined,
    address,
  )

  return data
}

export const getFullUsdValue = async () => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  return await ftService.getTotalUSDBalance(
    userPrincipal,
    Principal.fromText(publicKey),
  )
}
