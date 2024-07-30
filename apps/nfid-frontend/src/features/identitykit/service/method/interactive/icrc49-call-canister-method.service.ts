import { IDL } from "@dfinity/candid"
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { Agent, HttpAgent, Identity } from "@nfid/agent"
import { WALLET_SESSION_TTL_1_MIN_IN_MS } from "@nfid/config"
import { Chain, authState, getGlobalKeys } from "@nfid/integration"

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

const IC_HOSTNAME = "https://ic0.app"

export interface CallCanisterComponentData extends ComponentData {
  origin: string
  methodName: string
  canisterId: string
  sender: string
  args: string
  consentMessage?: string
}

export interface Icrc49Dto {
  canisterId: string
  sender: string
  method: string
  arg: string
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

    const agent: Agent = new HttpAgent({
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

    const agent: Agent = new HttpAgent({
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

    const interfaceFactory = await interfaceFactoryService.getInterfaceFactory(
      icrc49Dto.canisterId,
      agent,
    )
    const idl: IDL.ServiceClass = interfaceFactory({ IDL })
    const func: IDL.FuncClass = idl._fields.find(
      (x: unknown[]) => icrc49Dto.method === x[0],
    )![1]
    const argument = JSON.stringify(
      IDL.decode(func.argTypes, Buffer.from(icrc49Dto.arg, "base64")),
    )

    return {
      ...baseData,
      origin: message.origin,
      methodName: icrc49Dto.method,
      canisterId: icrc49Dto.canisterId,
      sender: icrc49Dto.sender,
      args: argument,
      consentMessage,
    }
  }

  private async getIdentity(dto: Icrc49Dto, account: Account) {
    if (account.type === AccountType.GLOBAL) {
      return await getGlobalKeys(
        authState.get().delegationIdentity!,
        Chain.IC,
        [CANDID_UI_CANISTER, dto.canisterId],
      )
    }

    if (
      account.type === AccountType.SESSION ||
      account.type === AccountType.SESSION_WITHOUT_DERIVATION
    ) {
      return await getGlobalKeys(
        authState.get().delegationIdentity!,
        Chain.IC,
        [dto.canisterId],
        account?.derivationOrigin ?? account.origin,
      )
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

    const connectedAccounts = JSON.parse(connectedAccountsJSON) as Account[]
    const sender = connectedAccounts.find(
      (acc) => acc.principal === senderPrincipal,
    )

    if (!sender)
      throw new GenericError(
        "Sender principal is not one of connected accounts.",
      )

    return sender
  }
}

export const icrc49CallCanisterMethodService =
  new Icrc49CallCanisterMethodService()
