import { DelegationChain, Ed25519PublicKey } from "@dfinity/identity"
import { fromBase64, toBase64 } from "@slide-computer/signer"
import { authStorage } from "packages/integration/src/lib/authentication/storage"
import {
  Chain,
  GLOBAL_ORIGIN,
  ecdsaGetAnonymous,
} from "packages/integration/src/lib/lambda/ecdsa"

import { authState, getGlobalKeysThirdParty } from "@nfid/integration"

import { getLegacyThirdPartyAuthSession } from "frontend/features/authentication/services"
import { delegationChainFromDelegation } from "frontend/integration/identity/delegation-chain-from-delegation"

import {
  Account,
  AccountType,
  RPCMessage,
  RPCSuccessResponse,
} from "../../../type"
import {
  accountService,
  INDEX_DB_CONNECTED_ACCOUNTS_KEY,
} from "../../account.service"
import { GenericError } from "../../exception-handler.service"
import { targetService } from "../../target.service"
import {
  ComponentData,
  InteractiveMethodService,
} from "./interactive-method.service"

export interface AccountsComponentData extends ComponentData {
  publicProfile: Account
  anonymous: Account[]
  isPublicAvailable: boolean
}

export interface Icrc34Dto {
  publicKey: string
  targets: string[]
  derivationOrigin?: string
  maxTimeToLive: string
}

class Icrc34DelegationMethodService extends InteractiveMethodService {
  public getMethod(): string {
    return "icrc34_delegation"
  }

  public requiresAuthentication(): boolean {
    return true
  }

  public async onApprove(
    message: MessageEvent<RPCMessage>,
    data?: unknown,
  ): Promise<RPCSuccessResponse> {
    const icrc34Dto = message.data.params as unknown as Icrc34Dto
    const account = data as Account
    const sessionPublicKey = Ed25519PublicKey.fromDer(
      fromBase64(icrc34Dto.publicKey),
    )

    const chain = await this.getChain(
      account,
      icrc34Dto,
      sessionPublicKey,
      message.origin,
    )

    const response: RPCSuccessResponse = {
      origin: message.origin,
      jsonrpc: message.data.jsonrpc,
      id: message.data.id,
      result: this.formatDelegationChain(chain),
    }

    await authStorage.set(
      INDEX_DB_CONNECTED_ACCOUNTS_KEY(message.origin),
      JSON.stringify([account]),
    )

    return response
  }

  public async getComponentData(
    message: MessageEvent<RPCMessage>,
  ): Promise<AccountsComponentData> {
    const accounts = await accountService.getAccounts(
      message.origin,
      message.data?.params?.derivationOrigin,
    )
    if (!accounts) throw new GenericError("User data has not been found")

    const icrc34Dto = message.data.params as unknown as Icrc34Dto
    const isPublicAccountsAllowed = await this.isPublicAccountsAllowed(
      icrc34Dto.targets,
      message.origin,
    )

    const baseData = await super.getComponentData(message)

    return {
      ...baseData,
      publicProfile: accounts.public,
      anonymous: accounts.anonymous,
      isPublicAvailable: isPublicAccountsAllowed,
    }
  }

  private formatDelegationChain(chain: DelegationChain) {
    return {
      signerDelegation: chain.delegations.map((signedDelegation) => {
        const { delegation, signature } = signedDelegation
        const { targets } = delegation
        return {
          delegation: Object.assign(
            {
              expiration: delegation.expiration,
              pubkey: toBase64(delegation.pubkey),
            },
            targets && {
              targets: targets.map((t) => t.toText()),
            },
          ),
          signature: toBase64(signature),
        }
      }),
      publicKey: toBase64(chain.publicKey),
    }
  }

  async getChain(
    accountKeyIdentity: Account,
    icrc34Dto: Icrc34Dto,
    sessionPublicKey: Ed25519PublicKey,
    origin: string,
    derivationOrigin?: string,
  ): Promise<DelegationChain> {
    const auth = authState.get()
    if (!auth.delegationIdentity) throw new Error("No delegation identity")

    if (accountKeyIdentity.type === AccountType.GLOBAL) {
      const del = await getGlobalKeysThirdParty(
        auth.delegationIdentity,
        icrc34Dto.targets,
        new Uint8Array(sessionPublicKey.toDer()),
        GLOBAL_ORIGIN,
        icrc34Dto.maxTimeToLive
          ? Number(BigInt(icrc34Dto.maxTimeToLive) / BigInt(1000000))
          : undefined,
      )

      return del
    }

    if (accountKeyIdentity.type === AccountType.SESSION) {
      return await ecdsaGetAnonymous(
        derivationOrigin ?? origin,
        new Uint8Array(sessionPublicKey.toDer()),
        auth.delegationIdentity,
        Chain.IC,
        icrc34Dto.maxTimeToLive
          ? Number(BigInt(icrc34Dto.maxTimeToLive) / BigInt(1000000))
          : undefined,
      )
    }

    if (accountKeyIdentity.type === AccountType.SESSION_WITHOUT_DERIVATION) {
      return await ecdsaGetAnonymous(
        origin,
        new Uint8Array(sessionPublicKey.toDer()),
        auth.delegationIdentity,
        Chain.IC,
        icrc34Dto.maxTimeToLive
          ? Number(BigInt(icrc34Dto.maxTimeToLive) / BigInt(1000000))
          : undefined,
      )
    }

    if (accountKeyIdentity.type === AccountType.ANONYMOUS_LEGACY) {
      const legacyAuthSession = await getLegacyThirdPartyAuthSession({
        derivationOrigin,
        hostname: origin,
        sessionPublicKey: new Uint8Array(sessionPublicKey.toDer()),
        maxTimeToLive: BigInt(icrc34Dto.maxTimeToLive) / BigInt(1000000),
      })

      return delegationChainFromDelegation(legacyAuthSession)
    }

    throw new Error("Invalid account type")
  }

  private async isPublicAccountsAllowed(targets: string[], origin: string) {
    if (!targets || targets.length === 0) return false

    try {
      await targetService.validateTargets(targets, origin)
      return true
    } catch (e: unknown) {
      const text = e instanceof Error ? e.message : "Unknown error"
      console.error("The targets cannot be validated:", text)
      return false
    }
  }
}

export const icrc34DelegationMethodService = new Icrc34DelegationMethodService()
