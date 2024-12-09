import { Principal } from "@dfinity/principal"
import { authState } from "@nfid/integration"
import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"

export const fetchActiveTokens = async () => {
  const { userId } = authState.getUserIdData()
  const data = await ftService.getAllUserTokens(userId)
  return data.items
}

export const initActiveTokens = async (activeTokens: FT[]) => {
  const { publicKey } = authState.getUserIdData()

  return await Promise.all(
    activeTokens.map((token) => {
      if (token.isInited()) return token
      return token.init(Principal.fromText(publicKey))
    }),
  )
}

export const fetchAllTokens = async (searchQuery: string) => {
  const { userId } = authState.getUserIdData()
  return await ftService.getAllTokens(userId, searchQuery)
}

export const getFullUsdValue = async (ft: FT[]) => {
  const { publicKey } = authState.getUserIdData()
  return await ftService.getTotalUSDBalance(Principal.fromText(publicKey), ft)
}

export const addAndInitToken = async (
  token: FT,
  activeTokens: FT[],
  allTokens: FT[],
) => {
  const { publicKey } = authState.getUserIdData()
  const index = activeTokens.findIndex(
    (t) => t.getTokenAddress() === token.getTokenAddress(),
  )

  const updatedActiveTokens = [...activeTokens]
  const updatedAllTokens = [...allTokens]

  if (index !== -1) return

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

  const updatedActiveTokens = [...activeTokens]
  const updatedAllTokens = [...allTokens]

  if (index === -1) return
  updatedActiveTokens.splice(index, 1)

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
