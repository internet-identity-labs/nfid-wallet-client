import { DerEncodedPublicKey, Signature } from "@dfinity/agent"
import { SignIdentity } from "@dfinity/agent"
import {
  Delegation,
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import { Principal } from "@dfinity/principal"
import { ii, cyclesMinter, ledgerWithIdentity } from "@nfid/integration"
import { principalToAddress, fromHexString } from "ictool"

import {
  Balance,
  RosettaRequest,
  TransactionHistory,
  XdrUsd,
} from "frontend/integration/rosetta/rosetta_interface"

import { BlockIndex, TransferResult } from "../_ic_api/ledger.d"
import {
  delegationIdentityFromSignedIdentity,
  fetchDelegate,
} from "../internet-identity"
import { mapToBalance, mapToTransactionHistory, mapToXdrUsd } from "./mapper"
import { restCall } from "./util"

declare const CURRCONV_TOKEN: string

const rosetta = "https://rosetta-api.internetcomputer.org"
export const WALLET_SCOPE = "nfid.one"
const converter = `https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=${
  CURRCONV_TOKEN ?? "df6440fc0578491bb13eb2088c4f60c7"
}`

export async function getBalance(principal: Principal): Promise<Balance> {
  let request: RosettaRequest = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/account/balance`, request).then(
    mapToBalance,
  )
}

export async function getTransactionHistory(
  principal: Principal,
): Promise<TransactionHistory> {
  let request: RosettaRequest = getRosettaRequest(principal)
  return await restCall("POST", `${rosetta}/search/transactions`, request).then(
    mapToTransactionHistory,
  )
}

export async function getExchangeRate(): Promise<number> {
  let xdrToIcp = await cyclesMinter
    .get_icp_xdr_conversion_rate()
    .then((x) => x.data.xdr_permyriad_per_icp)
    .catch((e) => {
      throw Error(`CyclesMinter failed!: ${e}`, e)
    })
  let xdrToUsd: XdrUsd = await restCall("GET", converter)
    .then(mapToXdrUsd)
    .catch((e) => {
      throw Error(`free.currconv.com failed!: ${e}`, e)
    })
  return (parseFloat(xdrToUsd.XDR_USD) * Number(xdrToIcp)) / 10000
}

//todo not properly tested. blocked by e2e
export async function transfer(
  amount: number,
  to: string,
  identity: SignIdentity,
): Promise<BlockIndex> {
  const ledgerWithWallet = ledgerWithIdentity(identity)

  const result: TransferResult = await ledgerWithWallet
    .transfer({
      to: fromHexString(to),
      amount: { e8s: BigInt(amount.toFixed()) },
      memo: BigInt(0),
      fee: { e8s: BigInt(10_000) },
      from_subaccount: [],
      created_at_time: [],
    })
    .catch((e) => {
      throw Error(`Transfer failed!: ${e}`, e)
    })

  if ("Err" in result) throw Error(Object.keys(result.Err)[0])
  return result.Ok
}

export async function getWalletPrincipal(anchor: number): Promise<Principal> {
  return ii.get_principal(BigInt(anchor), WALLET_SCOPE).catch((e) => {
    throw Error(`Getting of Wallet Principal failed!: ${e}`, e)
  })
}

// TODO WALLET. Code review delegation. Test should be written
const WALLET_SESSION_TTL = BigInt(2 * 60 * 1e9)

export async function getWalletDelegation(
  userNumber: number,
): Promise<DelegationIdentity> {
  // TODO WALLET. Code review delegation
  // const scope = getScope(WALLET_SCOPE)
  const scope = WALLET_SCOPE
  const sessionKey = Ed25519KeyIdentity.generate()
  const maxTimeToLive = WALLET_SESSION_TTL

  if (!sessionKey)
    throw new Error("getWalletDelegation. Unable to create sessionKey")

  const delegation = await fetchDelegate(
    userNumber,
    scope,
    Array.from(new Uint8Array(sessionKey.getPublicKey().toDer())),
    maxTimeToLive,
  )

  return await delegationIdentityFromSignedIdentity(
    sessionKey,
    DelegationChain.fromDelegations(
      [
        {
          delegation: new Delegation(
            new Uint8Array(
              delegation.signedDelegation.delegation.pubkey,
            ).buffer,
            delegation.signedDelegation.delegation.expiration,
            delegation.signedDelegation.delegation.targets,
          ),
          signature: new Uint8Array(delegation.signedDelegation.signature)
            .buffer as Signature,
        },
      ],
      new Uint8Array(delegation.userPublicKey).buffer as DerEncodedPublicKey,
    ),
  )
}

function getRosettaRequest(principal: Principal): RosettaRequest {
  let address: string = principalToAddress(principal as any)
  return {
    network_identifier: {
      blockchain: "Internet Computer",
      network: "00000000000000020101",
    },
    account_identifier: {
      address: address,
    },
  }
}
