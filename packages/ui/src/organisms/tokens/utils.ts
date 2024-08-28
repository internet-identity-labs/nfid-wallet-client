import { Principal } from "@dfinity/principal"

import { authState, Chain, getPublicKey } from "@nfid/integration"

import { ftService } from "frontend/integration/ft/ft-service"

const getPrincipal = async () => {
  const identity = authState.get().delegationIdentity
  const principalString = await getPublicKey(identity!, Chain.IC)
  return {
    principal: Principal.fromText(principalString),
    principalString,
  }
}

export const fetchAllTokens = async () => {
  const { principal } = await getPrincipal()
  const data = await ftService.getAllUserTokens(principal)
  return data.items
}

// export const getActiveTokens = async () => {
//   const { principalString } = await getPrincipal()
//   return await icrc1OracleService.getICRC1ActiveCanisters(principalString)
// }

// export const getFilteredTokens = async (searchQuery: string) => {
//   const { principalString } = await getPrincipal()
//   return await icrc1Service.getICRC1FilteredCanisters(
//     principalString,
//     searchQuery,
//   )
// }
