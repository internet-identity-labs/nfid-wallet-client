import { SignIdentity } from "@dfinity/agent"

import { stakingService } from "frontend/integration/staking/service/staking-service-impl"

import { getUserPrincipalId } from "../fungible-token/utils"

export const fetchStakedTokens = async (identity?: SignIdentity) => {
  if (!identity) return
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  return await stakingService.getStakedTokens(
    userPrincipal,
    publicKey,
    identity,
  )
}

export const fetchStakedToken = async (
  symbol: string,
  identity?: SignIdentity,
) => {
  const tokens = await fetchStakedTokens(identity)
  if (!tokens) return
  return tokens.find((token) => token.getToken().getTokenSymbol() === symbol)
}
