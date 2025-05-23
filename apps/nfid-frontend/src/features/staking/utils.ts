import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { ListNervousSystemFunctionsResponse } from "@dfinity/sns/dist/candid/sns_governance"

import { stakingService } from "frontend/integration/staking/service/staking-service-impl"

import { getUserPrincipalId } from "../fungible-token/utils"

export const fetchStakedTokens = async (identity: SignIdentity) => {
  const { userPrincipal, publicKey } = await getUserPrincipalId()
  return await stakingService.getStakedTokens(
    userPrincipal,
    publicKey,
    identity,
  )
}

export const fetchStakedToken = async (
  symbol: string,
  identity: SignIdentity,
) => {
  const tokens = await fetchStakedTokens(identity)
  return tokens.find((token) => token.getToken().getTokenSymbol() === symbol)
}

export const fetchDelegates = async (
  identity?: SignIdentity,
  root?: Principal,
): Promise<ListNervousSystemFunctionsResponse | undefined> => {
  if (!identity || !root) return
  return stakingService.getDelegates(identity, root)
}
