import { DelegationIdentity } from "@dfinity/identity"

const getExpirationDate = (expiration: bigint): Date =>
  new Date(Number(expiration / BigInt(1000000)))

export const getExpirationDelay = (delegation: DelegationIdentity) => {
  return delegation
    .getDelegation()
    .delegations.map(({ delegation: { expiration } }) =>
      getExpirationDate(expiration),
    )
    .map((expirationDate) => expirationDate.getTime() - Date.now())
    .reduce((min, current) => Math.min(min, current), Infinity)
}
