import { Principal } from "@dfinity/principal"

import { im } from "@nfid/integration"

import { ftService } from "frontend/integration/ft/ft-service"

const getUserPrincipalId = async () => {
  const account = await im.get_account()
  return account.data[0]!.principal_id
}

export const fetchAllTokens = async () => {
  const userPrincipal = await getUserPrincipalId()
  const data = await ftService.getAllUserTokens(
    Principal.fromText(userPrincipal),
  )
  return data.items
}

export const fetchTokenByAddress = async (address: string) => {
  const userPrincipal = await getUserPrincipalId()
  const data = await ftService.getUserTokenByAddress(
    Principal.fromText(userPrincipal),
    address,
  )
  return data
}

export const fetchFilteredTokens = async (searchQuery: string) => {
  const userPrincipal = await getUserPrincipalId()
  return await ftService.getAllFTokens(
    Principal.fromText(userPrincipal),
    searchQuery,
  )
}

export const getFullUsdValue = async () => {
  const userPrincipal = await getUserPrincipalId()
  return await ftService.getTotalUSDBalance(Principal.fromText(userPrincipal))
}
