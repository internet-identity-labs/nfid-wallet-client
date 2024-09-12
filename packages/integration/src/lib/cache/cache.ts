import { localStorageWithFallback } from "@nfid/client-db"
import { authState, getPublicKey, im } from "@nfid/integration"

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

  if (cachedValue) {
    const data = JSON.parse(cachedValue)

    let anchor
    if (data.anchor.trim().endsWith("n")) {
      anchor = data.anchor
    } else {
      anchor = BigInt(data.anchor)
    }

    return {
      userId: data.userId,
      publicKey: data.publicKey,
      anchor,
    }
  }

  const [publicKey, account] = await Promise.all([
    getPublicKey(identity),
    im.get_account(),
  ])

  if (!account.data[0]) {
    throw new Error(account.error[0])
  }

  const userIdPair = {
    userId: account.data[0]!.principal_id,
    publicKey: publicKey,
    anchor: account.data[0]!.anchor,
  }

  localStorageWithFallback.setItem(cacheKey, JSON.stringify(userIdPair))

  return userIdPair
}
