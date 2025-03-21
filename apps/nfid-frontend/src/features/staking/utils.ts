import { stakingService } from "frontend/integration/staking/service/staking-service-impl"

import { getUserPrincipalId } from "../fungible-token/utils"

export const fetchStakedTokens = async () => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  return await stakingService.getStakedTokens(userPrincipal, publicKey)
}

export const fetchStakedToken = async (symbol: string) => {
  const tokens = await fetchStakedTokens()
  return tokens.find((token) => token.getToken().getTokenSymbol() === symbol)
}
