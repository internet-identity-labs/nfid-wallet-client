import { Agent, HttpAgent, Identity } from "@dfinity/agent"
import { IDL } from "@dfinity/candid"
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"

import { WALLET_SESSION_TTL_1_MIN_IN_MS } from "@nfid/config"
import { authStorage } from "@nfid/integration"
import {
  authState,
  getAnonymousDelegation,
  getGlobalDelegation,
} from "@nfid/integration"

import { getLegacyThirdPartyAuthSession } from "frontend/features/authentication/services"
import { delegationChainFromDelegation } from "frontend/integration/identity/delegation-chain-from-delegation"

import {
  Account,
  AccountType,
  RPCMessage,
  RPCSuccessResponse,
} from "../../../type"
import { INDEX_DB_CONNECTED_ACCOUNTS_KEY } from "../../account.service"
import { callCanisterService } from "../../call-canister.service"
import { getDefaultMetadata } from "../../canister-calls-helpers/default"
import { getIcrc1TransferMetadata } from "../../canister-calls-helpers/icrc1-transfer"
import { getMetadataICRC2Approve } from "../../canister-calls-helpers/icrc2-approve"
import { getLedgerTransferMetadata } from "../../canister-calls-helpers/ledger-transfer"
import { consentMessageService } from "../../consent-message.service"
import { GenericError } from "../../exception-handler.service"
import {
  CANDID_UI_CANISTER,
  interfaceFactoryService,
} from "../../interface-factory.service"

import {
  ComponentData,
  InteractiveMethodService,
} from "./interactive-method.service"

export const IC_HOSTNAME = "https://ic0.app"

export interface CallCanisterComponentData extends ComponentData {
  origin: string
  methodName: string
  canisterId: string
  sender: string
  args: string
  consentMessage?: string
  metadata?: any
}

export interface Icrc49Dto {
  canisterId: string
  sender: string
  method: string
  arg: string
}

export type CallCanisterHelper = {
  [key: string]: (message: MessageEvent<RPCMessage>, args: any) => Promise<any>
}

class Icrc49CallCanisterMethodService extends InteractiveMethodService {
  public getMethod(): string {
    return "icrc49_call_canister"
  }

  public requiresAuthentication(): boolean {
    return true
  }

  public async onApprove(
    message: MessageEvent<RPCMessage>,
  ): Promise<RPCSuccessResponse> {
    const icrc49Dto = message.data.params as unknown as Icrc49Dto
    const sender = await this.getSender(message.origin, icrc49Dto.sender)

    const delegation = await this.getIdentity(icrc49Dto, sender)

    const agent: Agent = HttpAgent.createSync({
      host: IC_HOSTNAME,
      identity: delegation as unknown as Identity,
    })

    const callResponse = await callCanisterService.call({
      canisterId: icrc49Dto.canisterId,
      calledMethodName: icrc49Dto.method,
      parameters: icrc49Dto.arg,
      delegation,
      agent,
    })

    const response: RPCSuccessResponse = {
      origin: message.origin,
      jsonrpc: message.data.jsonrpc,
      id: message.data.id,
      result: {
        ...callResponse,
      },
    }

    return response
  }

  public async getComponentData(
    message: MessageEvent<RPCMessage>,
  ): Promise<CallCanisterComponentData> {
    const icrc49Dto = message.data.params as unknown as Icrc49Dto
    const sender = await this.getSender(message.origin, icrc49Dto.sender)
    const delegation = await this.getIdentity(icrc49Dto, sender)

    const agent: HttpAgent = HttpAgent.createSync({
      host: IC_HOSTNAME,
      identity: delegation as unknown as Identity,
    })

    const baseData = await super.getComponentData(message)
    const consentMessage = await consentMessageService.getConsentMessage(
      icrc49Dto.canisterId,
      icrc49Dto.method,
      icrc49Dto.arg,
      agent,
    )

    let argument: string
    try {
      const interfaceFactory =
        await interfaceFactoryService.getInterfaceFactory(
          icrc49Dto.canisterId,
          agent,
        )
      const idl: IDL.ServiceClass = interfaceFactory({ IDL })
      const func: IDL.FuncClass = idl._fields.find(
        (x: unknown[]) => icrc49Dto.method === x[0],
      )![1]
      const buffer = Buffer.from(icrc49Dto.arg, "base64")
      const arrayBuffer = new Uint8Array(buffer).buffer
      argument = JSON.stringify(IDL.decode(func.argTypes, arrayBuffer))
    } catch (e) {
      console.warn(
        "The candid service metadata has not been found, defaulting to the display of encoded data: ",
        e,
      )
      argument = icrc49Dto.arg
    }

    return {
      ...baseData,
      origin: message.origin,
      methodName: icrc49Dto.method,
      canisterId: icrc49Dto.canisterId,
      sender: icrc49Dto.sender,
      args: argument,
      consentMessage,
      metadata: await this.getRequestMetadata(message, argument),
    }
  }

  private async getIdentity(dto: Icrc49Dto, account: Account) {
    if (account.type === AccountType.GLOBAL) {
      return await getGlobalDelegation(authState.get().delegationIdentity!, [
        CANDID_UI_CANISTER,
        dto.canisterId,
      ])
    }

    if (
      account.type === AccountType.SESSION ||
      account.type === AccountType.SESSION_WITHOUT_DERIVATION
    ) {
      const sessionKey = Ed25519KeyIdentity.generate()

      const delegationChain = await getAnonymousDelegation(
        account?.derivationOrigin ?? account.origin,
        new Uint8Array(sessionKey.getPublicKey().toDer()),
        authState.get().delegationIdentity!,
      )

      return DelegationIdentity.fromDelegation(sessionKey, delegationChain)
    }

    if (account.type === AccountType.ANONYMOUS_LEGACY) {
      const sessionKey = Ed25519KeyIdentity.generate()
      const pk = new Uint8Array(sessionKey.getPublicKey().toDer())

      const legacyAuthSession = await getLegacyThirdPartyAuthSession({
        derivationOrigin: account.derivationOrigin,
        hostname: origin,
        sessionPublicKey: pk,
        maxTimeToLive: BigInt(WALLET_SESSION_TTL_1_MIN_IN_MS),
      })

      const delegationChain = delegationChainFromDelegation(legacyAuthSession)

      return DelegationIdentity.fromDelegation(sessionKey, delegationChain)
    }

    throw new GenericError("Account type is not defined")
  }

  private async getSender(origin: string, senderPrincipal: string) {
    const connectedAccountsJSON = await authStorage.get(
      INDEX_DB_CONNECTED_ACCOUNTS_KEY(origin),
    )
    if (!connectedAccountsJSON)
      throw new GenericError("We couldn't find connected account")

    const connectedAccounts = JSON.parse(
      connectedAccountsJSON as string,
    ) as Account[]
    const sender = connectedAccounts.find(
      (acc) => acc.principal === senderPrincipal,
    )

    if (!sender)
      throw new GenericError(
        "Sender principal is not one of connected accounts.",
      )

    return sender
  }

  private async getRequestMetadata(
    message: MessageEvent<RPCMessage>,
    args: any,
  ) {
    const helpers: CallCanisterHelper = {
      icrc2_approve: getMetadataICRC2Approve,
      transfer: getLedgerTransferMetadata,
      icrc1_transfer: getIcrc1TransferMetadata,
    }

    const helper = helpers[message.data.params.method]
    if (!helper) return getDefaultMetadata(message)

    return helper(message, args)
  }
}

export const icrc49CallCanisterMethodService =
  new Icrc49CallCanisterMethodService()
