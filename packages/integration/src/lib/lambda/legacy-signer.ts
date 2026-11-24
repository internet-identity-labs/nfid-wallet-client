import {
  Actor,
  type DerEncodedPublicKey,
  HttpAgent,
  type Signature,
  type SignIdentity,
} from "@icp-sdk/core/agent"
import { Delegation, DelegationChain } from "@icp-sdk/core/identity"
import { Principal } from "@icp-sdk/core/principal"

// The legacy delegation methods of signer_ic have the same Candid types as this IDL.
import { idlFactory as legacySignerIDL } from "../_ic_api/ecdsa_storage"
import {
  type CertifiedRoot,
  type DelegationChain as CandidDelegationChain,
  type _SERVICE as LegacySigner,
} from "../_ic_api/ecdsa_storage.d"
import { idlFactory as imIDL } from "../_ic_api/identity_manager"
import { type _SERVICE as IdentityManager } from "../_ic_api/identity_manager.d"
import { ic } from "../agent"

/**
 * Delegations of legacy accounts (anchor < 200M) signed by the signer_ic canister, which stores their
 * keys, instead of the AWS lambda. The caller proves its account with the Identity Manager certified root it requests itself.
 */
export function isLegacySignerEnabled(): boolean {
  return !!IC_SIGNER_CANISTER_ID
}

const CANISTER_ONLY_KEY_PREFIX = "nfid.legacySigner.canisterOnly."

function canisterOnlyKey(): string {
  return `${CANISTER_ONLY_KEY_PREFIX}${IC_SIGNER_CANISTER_ID}`
}

/** Set once the canister answered after a failed lambda call: the lambda is considered switched off. */
export function isCanisterOnly(): boolean {
  try {
    return localStorage.getItem(canisterOnlyKey()) === "1"
  } catch {
    return false
  }
}

function rememberCanisterOnly(): void {
  try {
    localStorage.setItem(canisterOnlyKey(), "1")
  } catch {
    // Without storage the lambda is simply tried first on every call.
  }
}

/**
 * The lambda is the primary signer. When the canister is configured, any lambda error falls back to
 * the canister; after the first such success this browser calls only the canister.
 */
export async function withCanisterFallback<T>(
  lambda: () => Promise<T>,
  canister: () => Promise<T>,
): Promise<T> {
  if (!isLegacySignerEnabled()) return lambda()
  if (isCanisterOnly()) return canister()

  try {
    return await lambda()
  } catch (lambdaError) {
    console.warn("Lambda signer failed, using the signer_ic canister", {
      lambdaError,
    })
    const result = await canister()
    rememberCanisterOnly()
    return result
  }
}

export async function getGlobalDelegationFromCanister(
  identity: SignIdentity,
  sessionPublicKey: Uint8Array,
  targets: string[],
  maxTimeToLive?: number,
): Promise<DelegationChain> {
  const agent = await createAgent(identity)
  const result = await legacySignerActor(agent).get_global_delegation({
    certified_root: await getCertifiedRoot(agent),
    session_key: sessionPublicKey,
    targets: toPrincipals(targets),
    delegation_ttl_ms: toTtl(maxTimeToLive),
  })
  return toDelegationChain(unwrap(result))
}

export async function getAnonymousDelegationFromCanister(
  identity: SignIdentity,
  domain: string,
  sessionPublicKey: Uint8Array,
  targets?: string[],
  maxTimeToLive?: number,
): Promise<DelegationChain> {
  const agent = await createAgent(identity)
  const result = await legacySignerActor(agent).get_anonymous_delegation({
    certified_root: await getCertifiedRoot(agent),
    domain,
    session_key: sessionPublicKey,
    targets: toPrincipals(targets),
    delegation_ttl_ms: toTtl(maxTimeToLive),
  })
  return toDelegationChain(unwrap(result))
}

export function toDelegationChain(
  chain: CandidDelegationChain,
): DelegationChain {
  return DelegationChain.fromDelegations(
    chain.delegations.map(({ delegation, signature }) => ({
      delegation: new Delegation(
        new Uint8Array(delegation.pubkey),
        delegation.expiration,
        delegation.targets[0],
      ),
      signature: new Uint8Array(signature) as Signature,
    })),
    new Uint8Array(chain.public_key) as DerEncodedPublicKey,
  )
}

export function unwrap<T>(result: { Ok: T } | { Err: string }): T {
  if ("Err" in result) throw new Error(result.Err)
  return result.Ok
}

async function createAgent(identity: SignIdentity): Promise<HttpAgent> {
  return HttpAgent.create({
    host: ic.host,
    identity,
    retryTimes: 10,
    shouldFetchRootKey: ic.isLocal,
  })
}

// Requested with the user's identity, so the Identity Manager applies its 2FA check.
async function getCertifiedRoot(agent: HttpAgent): Promise<CertifiedRoot> {
  const im = Actor.createActor<IdentityManager>(imIDL, {
    agent,
    canisterId: IDENTITY_MANAGER_CANISTER_ID,
  })
  const { response, certificate, witness } = await im.get_root_certified()
  return { root: response, certificate, witness }
}

function legacySignerActor(agent: HttpAgent) {
  return Actor.createActor<LegacySigner>(legacySignerIDL, {
    agent,
    canisterId: IC_SIGNER_CANISTER_ID,
  })
}

function toPrincipals(targets: string[] = []): Principal[] {
  return targets.filter((t) => !!t).map((t) => Principal.fromText(t))
}

function toTtl(maxTimeToLive?: number): [] | [bigint] {
  return maxTimeToLive === undefined ? [] : [BigInt(Math.floor(maxTimeToLive))]
}
