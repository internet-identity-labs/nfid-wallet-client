import { Principal } from "@dfinity/principal"
import { getUserIdData } from "packages/integration/src/lib/cache/cache"

import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"

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
  const { userPrincipal } = await getUserPrincipalId()
  const data = await ftService.getAllUserTokens(userPrincipal)
  return data.items
}

export const initActiveTokens = async (activeTokens: FT[]) => {
  const { publicKey } = await getUserPrincipalId()

  return await Promise.all(
    activeTokens.map((token) => {
      if (token.isInited()) return token
      return token.init(Principal.fromText(publicKey))
    }),
  )
}

export const fetchAllTokens = async (searchQuery: string) => {
  const { userPrincipal } = await getUserPrincipalId()
  return await ftService.getAllTokens(userPrincipal, searchQuery)
}

export const getFullUsdValue = async (ft: FT[]) => {
  const { publicKey } = await getUserPrincipalId()
  return await ftService.getTotalUSDBalance(Principal.fromText(publicKey), ft)
}

export const addAndInitToken = async (token: FT, allTokens: FT[]) => {
  const { publicKey } = await getUserPrincipalId()

  let updatedAllTokens = [...allTokens]

  !token.isInited() && (await token.init(Principal.fromText(publicKey)))

  const allIndex = allTokens.findIndex(
    (t) => t.getTokenAddress() === token.getTokenAddress(),
  )
  // if (allIndex === -1) {
  //   updatedAllTokens.push(token)
  // }

  return updatedAllTokens
}

export const removeToken = (token: FT, allTokens: FT[]) => {
  let updatedAllTokens = [...allTokens]

  const allIndex = allTokens.findIndex(
    (t) => t.getTokenAddress() === token.getTokenAddress(),
  )
  if (allIndex !== -1) {
    updatedAllTokens[allIndex]
  }

  console.log(updatedAllTokens)

  return updatedAllTokens
}
