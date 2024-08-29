import { Principal } from "@dfinity/principal"

import { authState, Chain, getPublicKey, im } from "@nfid/integration"

import { ftService } from "frontend/integration/ft/ft-service"

const getPrincipal = async () => {
  const identity = authState.get().delegationIdentity
  const principalString = await getPublicKey(identity!, Chain.IC)
  return {
    principal: Principal.fromText(principalString),
    principalString,
  }
}

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

// export const getActiveTokens = async () => {
//   const { principalString } = await getPrincipal()
//   return await icrc1OracleService.getICRC1ActiveCanisters(principalString)
// }
