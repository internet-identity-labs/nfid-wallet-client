import { localStorageWithFallback } from "@nfid/client-db"
import {
  authState,
  getPublicKey,
  hasOwnProperty,
  im,
  replaceActorIdentity,
  RootWallet,
} from "@nfid/integration"

type UserIdData = {
  //internal user id
  userId: string
  //public key of the user
  publicKey: string
  anchor: bigint
  wallet: RootWallet
}

//TODO move to authState
export const getUserIdData = async (): Promise<UserIdData> => {
  //get web3 auth delegation
  const identity = authState.get().delegationIdentity

  if (!identity) throw new Error("No identity")

  //web3 identity is unique per account so we can use it as a cache key
  const cacheKey = "user_profile_data_" + identity.getPrincipal().toText()

  const cachedValue = localStorageWithFallback.getItem(cacheKey)

  let data

  if (cachedValue) {
    data = JSON.parse(cachedValue)
  } else {
    await replaceActorIdentity(im, identity)
    const [publicKey, account] = await Promise.all([
      getPublicKey(identity),
      im.get_account(),
    ])
    const rootWallet: RootWallet = hasOwnProperty(account.data[0]!.wallet, "II")
      ? RootWallet.II
      : RootWallet.NFID
    data = {
      userId: account.data[0]!.principal_id,
      publicKey: publicKey,
      //BigInt is not serializable in a good way
      anchor: Number(account.data[0]!.anchor),
      wallet: rootWallet,
    }
    localStorageWithFallback.setItem(cacheKey, JSON.stringify(data))
  }

  return {
    userId: data.userId,
    publicKey: data.publicKey,
    anchor: BigInt(data.anchor),
    wallet: data.wallet,
  }
}
