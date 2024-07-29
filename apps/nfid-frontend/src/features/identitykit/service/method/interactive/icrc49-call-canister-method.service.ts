import { IDL } from "@dfinity/candid"

import { Agent, HttpAgent, Identity } from "@nfid/agent"
import { Chain, authState, getGlobalKeys } from "@nfid/integration"

import { RPCMessage, RPCSuccessResponse } from "../../../type"
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
    const delegation = await this.getGlobalKey([
      icrc49Dto.canisterId,
      CANDID_UI_CANISTER,
    ])

    if (
      icrc49Dto.sender.toLowerCase() !==
      delegation.getPrincipal().toString().toLowerCase()
    ) {
      throw new GenericError(
        "Sender principal doesn't match your account principal",
      )
    }

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

    const delegation = await this.getGlobalKey([
      icrc49Dto.canisterId,
      CANDID_UI_CANISTER,
    ])

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

  private async getGlobalKey(targets: string[]) {
    return await getGlobalKeys(
      authState.get().delegationIdentity!,
      Chain.IC,
      targets,
    )
  }
}

export const icrc49CallCanisterMethodService =
  new Icrc49CallCanisterMethodService()
