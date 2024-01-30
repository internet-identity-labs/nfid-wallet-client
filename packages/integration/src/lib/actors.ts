// A global singleton for our internet computer actors.
import * as Agent from "@dfinity/agent"
import {
  Actor,
  ActorMethod,
  HttpAgent,
  Identity,
  SignIdentity,
} from "@dfinity/agent"
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl"
import { DelegationIdentity } from "@dfinity/identity"

import { idlFactory as btcIDL } from "./_ic_api/btc-wallet"
import { _SERVICE as Btc } from "./_ic_api/btc-wallet.d"
import { idlFactory as cyclesMinterIDL } from "./_ic_api/cycles_minter"
import { _SERVICE as CyclesMinter } from "./_ic_api/cycles_minter.d"
import { idlFactory as ecdsaSignerIDL } from "./_ic_api/ecdsa-signer"
import { _SERVICE as EcdsaSigner } from "./_ic_api/ecdsa-signer.d"
import { _SERVICE as BtcSigner } from "./_ic_api/ecdsa-signer.d"
import { idlFactory as ethSecretStorageIDL } from "./_ic_api/eth_secret_storage"
import { _SERVICE as EthSecretStorage } from "./_ic_api/eth_secret_storage.d"
import { idlFactory as iCRC1RegistryIDL } from "./_ic_api/icrc1_registry"
import { _SERVICE as ICRC1Registry } from "./_ic_api/icrc1_registry.d"
import { idlFactory as imIDL } from "./_ic_api/identity_manager"
import { _SERVICE as IdentityManager } from "./_ic_api/identity_manager.d"
import { idlFactory as iiIDL } from "./_ic_api/internet_identity"
import { _SERVICE as InternetIdentity } from "./_ic_api/internet_identity.d"
import { idlFactory as ledgerIDL } from "./_ic_api/ledger"
import { _SERVICE as Ledger } from "./_ic_api/ledger.d"
import { idlFactory as pubsubIDL } from "./_ic_api/pub_sub_channel"
import { _SERVICE as PubSub } from "./_ic_api/pub_sub_channel.d"
import { idlFactory as vaultIDL } from "./_ic_api/vault"
import { _SERVICE as Vault } from "./_ic_api/vault.d"
import { idlFactory as verifierIDL } from "./_ic_api/verifier"
import { _SERVICE as Verifier } from "./_ic_api/verifier.d"
import { agent } from "./agent"
import { TOKEN_CANISTER } from "./token/dip-20/constants"

/////////////
// Config //
///////////

const canisterConfig = [
  ["Internet Identity", INTERNET_IDENTITY_CANISTER_ID],
  ["Identity Manager", IDENTITY_MANAGER_CANISTER_ID],
  ["Pubsub", PUB_SUB_CHANNEL_CANISTER_ID],
  ["Verifier", VERIFIER_CANISTER_ID],
  ["Ledger", LEDGER_CANISTER_ID],
  ["CyclesMinter", CYCLES_MINTER_CANISTER_ID],
  ["Vault", VAULT_CANISTER_ID],
  ["EthSecretStorage", ETH_SECRET_STORAGE_CANISTER_ID],
  ["EcdsaSigner", ECDSA_SIGNER_CANISTER_ID],
  ["BtcSigner", BTC_SIGNER_CANISTER_ID],
  ["ICSigner", IC_SIGNER_CANISTER_ID],
]

export const accessList = [
  ...canisterConfig.map((x) => x[1]),
  ...TOKEN_CANISTER,
]

// NOTE: Might be nice to have the canister named in this exception
for (const [label, canister] of canisterConfig) {
  if (!canister)
    throw new Error(`Missing canister id for "${label}", please check envars.`)
}

export const agentBaseConfig = { host: "https://ic0.app" }

/**
 * Create an actor.
 */
export function actor<T>(
  canisterId: string,
  factory: InterfaceFactory,
  config?: Partial<Agent.ActorConfig>,
): Agent.ActorSubclass<T> {
  return Agent.Actor.createActor(factory, { canisterId, agent, ...config })
}

export function ledgerWithIdentity(identity: SignIdentity) {
  return actor<Ledger>(LEDGER_CANISTER_ID, ledgerIDL, {
    agent: new HttpAgent({ ...agentBaseConfig, identity }),
  })
}

export async function initActor(
  identity: Identity,
  canisterId: string,
  factory: InterfaceFactory,
): Promise<Record<string, ActorMethod>> {
  return actor(canisterId, factory, {
    agent: new HttpAgent({ ...agentBaseConfig, identity }),
  })
}

export async function replaceActorIdentity(
  actor: Actor,
  identity: SignIdentity,
) {
  const actorAgent = Actor.agentOf(actor)
  if (actorAgent?.replaceIdentity) actorAgent.replaceIdentity(identity)
}

// All of the actor definitions needed in our app should go here.

export const pubsub = actor<PubSub>(PUB_SUB_CHANNEL_CANISTER_ID, pubsubIDL)
export const ii = actor<InternetIdentity>(INTERNET_IDENTITY_CANISTER_ID, iiIDL)
export const im = actor<IdentityManager>(IDENTITY_MANAGER_CANISTER_ID, imIDL)
export const verifier = actor<Verifier>(VERIFIER_CANISTER_ID, verifierIDL)
export const ledger = actor<Ledger>(LEDGER_CANISTER_ID, ledgerIDL)
export const iCRC1Registry = actor<ICRC1Registry>(
  ICRC1_REGISTRY_CANISTER_ID,
  iCRC1RegistryIDL,
)

export const vault = Agent.Actor.createActor<Vault>(vaultIDL, {
  canisterId: VAULT_CANISTER_ID,
  agent: new HttpAgent({ ...agentBaseConfig }),
})

export const ecdsaSigner = Agent.Actor.createActor<EcdsaSigner>(
  ecdsaSignerIDL,
  {
    canisterId: ECDSA_SIGNER_CANISTER_ID,
    agent: new HttpAgent({ ...agentBaseConfig }),
  },
)

export const icSigner = Agent.Actor.createActor<EcdsaSigner>(ecdsaSignerIDL, {
  canisterId: IC_SIGNER_CANISTER_ID,
  agent: new HttpAgent({ ...agentBaseConfig }),
})

export const btcSigner = Agent.Actor.createActor<BtcSigner>(ecdsaSignerIDL, {
  canisterId: BTC_SIGNER_CANISTER_ID,
  agent: new HttpAgent({ ...agentBaseConfig }),
})

export const btcWallet = Agent.Actor.createActor<Btc>(btcIDL, {
  canisterId: BITCOIN_WALLET_CANISTER_ID,
  agent: new HttpAgent({ ...agentBaseConfig }),
})

export const ethSecretStorage = actor<EthSecretStorage>(
  ETH_SECRET_STORAGE_CANISTER_ID,
  ethSecretStorageIDL,
)
export const cyclesMinter = actor<CyclesMinter>(
  CYCLES_MINTER_CANISTER_ID,
  cyclesMinterIDL,
)
