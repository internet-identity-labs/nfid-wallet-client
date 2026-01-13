import { DelegationChain, Ed25519PublicKey } from "@dfinity/identity"

import { authStorage } from "@nfid/integration"
import { getAnonymousDelegation } from "@nfid/integration"
import { authState, getGlobalDelegationChain } from "@nfid/integration"

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
import { targetService, VerificationReport } from "../../target.service"

import {
  ComponentData,
  InteractiveMethodService,
} from "./interactive-method.service"

export interface AccountsComponentData extends ComponentData {
  publicProfile: Account
  anonymous: Account[]
  getVerificationReport: () => Promise<VerificationReport>
}

export interface Icrc34Dto {
  publicKey: string
  targets: string[]
  derivationOrigin?: string
  maxTimeToLive: string
}

const ENCODE_CHUNK_SIZE = 100000

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
      this.fromBase64(icrc34Dto.publicKey),
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
    const getVerificationReport = this.getVerificationReport(
      icrc34Dto.targets,
      message.origin,
    )

    const baseData = await super.getComponentData(message)

    return {
      ...baseData,
      publicProfile: accounts.public,
      anonymous: accounts.anonymous,
      getVerificationReport,
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
              pubkey: this.toBase64(delegation.pubkey),
            },
            targets && {
              targets: targets.map((t) => t.toText()),
            },
          ),
          signature: this.toBase64(signature),
        }
      }),
      publicKey: this.toBase64(chain.publicKey),
    }
  }

  async getChain(
    accountKeyIdentity: Account,
    icrc34Dto: Icrc34Dto,
    sessionPublicKey: Ed25519PublicKey,
    origin: string,
  ): Promise<DelegationChain> {
    const auth = authState.get()
    if (!auth.delegationIdentity) throw new Error("No delegation identity")

    if (accountKeyIdentity.type === AccountType.GLOBAL) {
      const del = await getGlobalDelegationChain(
        auth.delegationIdentity,
        icrc34Dto.targets,
        new Uint8Array(sessionPublicKey.toDer()),
        origin,
        icrc34Dto.maxTimeToLive
          ? Number(BigInt(icrc34Dto.maxTimeToLive) / BigInt(1000000))
          : undefined,
      )

      return del
    }

    if (accountKeyIdentity.type === AccountType.SESSION) {
      return await getAnonymousDelegation(
        icrc34Dto.derivationOrigin ?? origin,
        new Uint8Array(sessionPublicKey.toDer()),
        auth.delegationIdentity,
        icrc34Dto.maxTimeToLive
          ? Number(BigInt(icrc34Dto.maxTimeToLive) / BigInt(1000000))
          : undefined,
      )
    }

    if (accountKeyIdentity.type === AccountType.SESSION_WITHOUT_DERIVATION) {
      return await getAnonymousDelegation(
        origin,
        new Uint8Array(sessionPublicKey.toDer()),
        auth.delegationIdentity,
        icrc34Dto.maxTimeToLive
          ? Number(BigInt(icrc34Dto.maxTimeToLive) / BigInt(1000000))
          : undefined,
      )
    }

    if (accountKeyIdentity.type === AccountType.ANONYMOUS_LEGACY) {
      const legacyAuthSession = await getLegacyThirdPartyAuthSession({
        derivationOrigin: icrc34Dto.derivationOrigin,
        hostname: origin,
        sessionPublicKey: new Uint8Array(sessionPublicKey.toDer()),
        maxTimeToLive: BigInt(icrc34Dto.maxTimeToLive),
      })

      return delegationChainFromDelegation(legacyAuthSession)
    }

    throw new Error("Invalid account type")
  }

  private getVerificationReport(
    targets: string[],
    origin: string,
  ): () => Promise<VerificationReport> {
    return () => targetService.getVerificationReport(targets, origin)
  }

  private fromBase64(base64: string): ArrayBuffer {
    if (typeof globalThis.Buffer !== "undefined") {
      return globalThis.Buffer.from(base64, "base64").buffer
    }
    if (typeof globalThis.atob !== "undefined") {
      return Uint8Array.from(globalThis.atob(base64), (m) => m.charCodeAt(0))
        .buffer
    }
    throw Error("Could not decode base64 string")
  }

  private toBase64(bytes: ArrayBuffer): string {
    if (typeof globalThis.Buffer !== "undefined") {
      return globalThis.Buffer.from(bytes).toString("base64")
    }
    if (typeof globalThis.btoa !== "undefined") {
      return btoa(
        Array.from({ length: Math.ceil(bytes.byteLength / ENCODE_CHUNK_SIZE) })
          .map((_, index) =>
            String.fromCharCode(
              ...new Uint8Array(
                bytes.slice(
                  index * ENCODE_CHUNK_SIZE,
                  (index + 1) * ENCODE_CHUNK_SIZE,
                ),
              ),
            ),
          )
          .join(""),
      )
    }
    throw Error("Could not encode base64 string")
  }
}

export const icrc34DelegationMethodService = new Icrc34DelegationMethodService()
