import { Principal } from "@dfinity/principal"

import { authState, getPublicKey, im } from "@nfid/integration"

import { ftService } from "frontend/integration/ft/ft-service"

const getUserPrincipalId = async () => {
  const identity = authState.get().delegationIdentity
  if (!identity) throw new Error("No identity")
  const publicKey = await getPublicKey(identity)
  const account = await im.get_account()
  return {
    userPrincipal: account.data[0]!.principal_id,
    publicKey: Principal.fromText(publicKey),
  }
}

export const fetchAllTokens = async () => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  const data = await ftService.getAllUserTokens(userPrincipal, publicKey)
  const sortedItems = data.items.sort((a, b) => {
    if (a.getTokenSymbol() === "ICP") return -1
    if (b.getTokenSymbol() === "ICP") return 1
    return 0
  })
  return sortedItems
}

export const fetchTokenByAddress = async (address: string) => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  const data = await ftService.getUserTokenByAddress(
    userPrincipal,
    publicKey,
    address,
  )
  return data
}

export const fetchFilteredTokens = async (searchQuery: string) => {
  const { userPrincipal } = await getUserPrincipalId()
  return await ftService.getAllFTokens(userPrincipal, searchQuery)
}

export const getFullUsdValue = async () => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  return await ftService.getTotalUSDBalance(userPrincipal, publicKey)
}
