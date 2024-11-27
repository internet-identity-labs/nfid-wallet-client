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

export const addAndInitToken = async (
  token: FT,
  activeTokens: FT[],
  allTokens: FT[],
) => {
  const { publicKey } = await getUserPrincipalId()
  const index = activeTokens.findIndex(
    (t) => t.getTokenAddress() === token.getTokenAddress(),
  )

  let updatedActiveTokens = [...activeTokens]
  let updatedAllTokens = [...allTokens]

  if (index !== -1) return
  token.setTokenState(State.Active)

  !token.isInited() && (await token.init(Principal.fromText(publicKey)))
  updatedActiveTokens.push(token)

  const allIndex = allTokens.findIndex(
    (t) => t.getTokenAddress() === token.getTokenAddress(),
  )
  if (allIndex === -1) {
    updatedAllTokens.push(token)
  }

  return {
    updatedAllTokens,
    updatedActiveTokens,
  }
}

export const removeToken = (token: FT, activeTokens: FT[], allTokens: FT[]) => {
  const index = activeTokens.findIndex(
    (t) => t.getTokenAddress() === token.getTokenAddress(),
  )

  let updatedActiveTokens = [...activeTokens]
  let updatedAllTokens = [...allTokens]

  if (index === -1) return
  updatedActiveTokens.splice(index, 1)

  token.setTokenState(State.Inactive)
  const allIndex = allTokens.findIndex(
    (t) => t.getTokenAddress() === token.getTokenAddress(),
  )
  if (allIndex !== -1) {
    updatedAllTokens.splice(allIndex, 1)
  }

  return {
    updatedAllTokens,
    updatedActiveTokens,
  }
}
