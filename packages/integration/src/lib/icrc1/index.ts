import * as Agent from "@dfinity/agent"
import { HttpAgent, Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { idlFactory as icrc1IDL } from "../_ic_api/icrc1"
import {
  _SERVICE as ICRC1,
  Icrc1TransferResult,
  TransferArg,
} from "../_ic_api/icrc1.d"
import { agentBaseConfig, iCRC1Registry } from "../actors"
import {TokenPrice} from "../asset/types";
import {PriceService} from "../asset/asset-util";


const errorText = "This does not appear to be an ICRC1 compatible canister"
const network = "Internet Computer"
const icpCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai"


export interface ICRC1Data {
  balance: bigint
  name: string
  symbol: string
  decimals: number
  fee: bigint
  canisterId: string
  network: string
  priceInUsd: number | undefined
  logo: string | undefined
}

/*
 * rootPrincipalId: the principal id of the account im.getAccount().principalId
 * publicKey: the public key returned by lambda ecdsa.ts getPublicKey() => convert to principal with Ed25519JSONableKeyIdentity
 */
export async function getICRC1DataForUser(
  rootPrincipalId: string,
  publicKey: string,
): Promise<Array<ICRC1Data>> {
  const canisters = await getICRC1Canisters(rootPrincipalId)
  return getICRC1Data(canisters, publicKey)
}

export async function isICRC1Canister(
  canisterId: string,
  rootPrincipalId: string,
  publicKey: string,
): Promise<ICRC1Data> {
  const actor = Agent.Actor.createActor<ICRC1>(icrc1IDL, {
    canisterId: canisterId,
    agent: new HttpAgent({ ...agentBaseConfig }),
  })
  const standards = await actor.icrc1_supported_standards()
  const isICRC1: boolean = standards
    .map((standard) => standard.name)
    .some((name) => name === "ICRC-1")
  if (!isICRC1) {
    throw new Error(errorText)
  }
  await getICRC1Canisters(rootPrincipalId).then((icrc1) => {
    if (
      icrc1.map((c) => c).includes(canisterId)
    ) {
      throw Error("Canister already added.")
    }
    if (canisterId === icpCanisterId) {
      throw Error("Canister cannot be added.")
    }
  })
  return getICRC1Data([canisterId], publicKey)
    .then((data) => {
      return data[0]
    })
    .catch((e) => {
      console.error(`isICRC1Canister error: ` + e)
      throw new Error(errorText)
    })
}

export async function transferICRC1(
  globalAccountPrincipal: Identity,
  iCRC1Canister: string,
  args: TransferArg,
): Promise<Icrc1TransferResult> {
  const actor = Agent.Actor.createActor<ICRC1>(icrc1IDL, {
    canisterId: iCRC1Canister,
    agent: new HttpAgent({
      host: "https://ic0.app",
      identity: globalAccountPrincipal,
    }),
  })
  return await actor.icrc1_transfer(args)
}

export async function getICRC1Canisters(
  principal: string,
): Promise<Array<string>> {
  return iCRC1Registry.get_canisters_by_root(principal)
}

export async function addICRC1Canister(canisterId: string): Promise<void> {
  await iCRC1Registry.store_icrc1_canister(canisterId)
}

export async function getICRC1Data(
  canisters: Array<string>,
  publicKeyInPrincipal: string,
): Promise<Array<ICRC1Data>> {
  const priceList: TokenPrice[] = await new PriceService().getPriceFull()
  return Promise.all(
    canisters.map(async (canisterId) => {
      const actor = Agent.Actor.createActor<ICRC1>(icrc1IDL, {
        canisterId: canisterId,
        agent: new HttpAgent({ ...agentBaseConfig }),
      })
      const balance = await actor.icrc1_balance_of({
        subaccount: [],
        owner: Principal.fromText(publicKeyInPrincipal),
      })
      const metadata = await actor.icrc1_metadata()
      let name = ""
      let symbol = ""
      let logo: string | undefined = undefined
      let decimals = 0
      let fee = BigInt(0)

      for (let i = 0; i < metadata.length; i++) {
        const data = metadata[i]
        if (data[0] === "icrc1:name") {
          const val = data[1] as { Text: string }
          name = val.Text
        } else if (data[0] === "icrc1:symbol") {
          const val = data[1] as { Text: string }
          symbol = val.Text
        } else if (data[0] === "icrc1:decimals") {
          const val = data[1] as { Nat: bigint }
          decimals = Number(val.Nat)
        } else if (data[0] === "icrc1:fee") {
          const val = data[1] as { Nat: bigint }
          fee = val.Nat
        } else if (data[0] === "icrc1:logo") {
          const val = data[1] as { Text: string }
          logo = val.Text
        }
      }
      const priceInToken = priceList[symbol as any]
      const priceInUsd = priceInToken
        ? Number((1 / Number(priceInToken)).toFixed(2))
        : undefined

      const balanceNumber = priceInUsd
        ? (Number(balance) / Math.pow(10, Number(decimals))) * priceInUsd
        : undefined

      const isListedOnUSD = typeof priceInToken !== "undefined"

      let roundedBalanceNumber: number | undefined = undefined

      if (isListedOnUSD) {
        roundedBalanceNumber =
          balanceNumber === 0 ? 0 : Number(balanceNumber?.toFixed(2))
      }

      return {
        balance,
        canisterId,
        decimals,
        fee,
        name,
        symbol,
        network,
        priceInUsd: roundedBalanceNumber,
        logo: logo,
      }
    }),
  )
}

