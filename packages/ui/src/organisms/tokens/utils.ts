import { Principal } from "@dfinity/principal"
import crypto from "crypto-browserify"

import { authState } from "@nfid/integration"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"

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

export const initTokens = async (tokens: FT[]) => {
  const { publicKey } = await getUserPrincipalId()

  return await Promise.all(
    tokens.map((token) => {
      if (token.isInited()) return token
      return token.init(Principal.fromText(publicKey))
    }),
  )
}

export const fetchTokens = async () => {
  const { userPrincipal } = await getUserPrincipalId()
  return await ftService.getTokens(userPrincipal)
}

export const getFullUsdValue = async (ft: FT[]) => {
  const { publicKey } = authState.getUserIdData()
  return await ftService.getTotalUSDBalance(Principal.fromText(publicKey), ft)
}

export const generateTokenKey = (tokens: FT[]) => {
  const str = tokens
    .map((token) => `${token.getTokenAddress()}-${token.getTokenState()}`)
    .join(",")

  return crypto.createHash("sha256").update(str).digest("hex")
}
