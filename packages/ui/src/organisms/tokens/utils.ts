import { Principal } from "@dfinity/principal"

import { localStorageWithFallback } from "@nfid/client-db"
import { authState, getPublicKey, im } from "@nfid/integration"

import { ftService } from "frontend/integration/ft/ft-service"

export const getUserPrincipalId = async (): Promise<{
  userPrincipal: string
  publicKey: string
}> => {
  const identity = authState.get().delegationIdentity
  if (!identity) throw new Error("No identity")
  const cacheKey = "getUserPrincipalId" + identity.getPrincipal().toText()

  const cachedValue = localStorageWithFallback.getItem(cacheKey)
  if (cachedValue) return JSON.parse(cachedValue) as any
  const [publicKey, account] = await Promise.all([
    getPublicKey(identity),
    im.get_account(),
  ])
  localStorageWithFallback.setItem(
    cacheKey,
    JSON.stringify({
      userPrincipal: account.data[0]!.principal_id,
      publicKey: publicKey,
    }),
  )
  return {
    userPrincipal: account.data[0]!.principal_id,
    publicKey: publicKey,
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
