import {authState, getPublicKey, im} from "@nfid/integration";
import {localStorageWithFallback} from "@nfid/client-db";

type UserIdData = {
  //internal user id
  userId: string
  //public key of the user
  publicKey: string
  anchor: bigint
}


//TODO move to authState
export const getUserIdData = async (): Promise<UserIdData> => {
  //get web3 auth delegation
  const identity = authState.get().delegationIdentity

  if (!identity) throw new Error("No identity")

  //web3 identity is unique per account so we can use it as a cache key
  const cacheKey = "user_id_public_pair_" + identity.getPrincipal().toText()

  const cachedValue = localStorageWithFallback.getItem(cacheKey)

  if (cachedValue) return JSON.parse(cachedValue) as UserIdData

  const [publicKey, account] = await Promise.all([
    getPublicKey(identity),
    im.get_account(),
  ])

  if(account.error) {
    throw new Error(account.error[0])
  }

  const userIdPair = {
    userId: account.data[0]!.principal_id,
    publicKey: publicKey,
    anchor: account.data[0]!.anchor,
  }
  
  localStorageWithFallback.setItem(
    cacheKey,
    JSON.stringify(userIdPair),
  )

  return userIdPair
}
