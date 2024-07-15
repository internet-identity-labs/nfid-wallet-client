import { Account, RPCMessage, RPCSuccessResponse } from "../../../type"
import { accountService } from "../../account.service"
import { GenericError } from "../../exception-handler.service"
import {
  ComponentData,
  InteractiveMethodService,
} from "./interactive-method.service"

export interface AccountsComponentData extends ComponentData {
  public: Account
  anonymous: Account[]
}

class Icrc27AccountsMethodService extends InteractiveMethodService {
  public getMethod(): string {
    return "icrc27_accounts"
  }

  public requiresAuthentication(): boolean {
    return true
  }

  public async onApprove(
    message: MessageEvent<RPCMessage>,
    data?: unknown,
  ): Promise<RPCSuccessResponse> {
    const accounts = data as Account[]

    const accountsResponse = accounts.map((x) => {
      return {
        owner: x.principal,
        subaccount: x.subaccount,
      }
    })

    const response: RPCSuccessResponse = {
      origin: message.origin,
      jsonrpc: message.data.jsonrpc,
      id: message.data.id,
      result: {
        accounts: accountsResponse,
      },
    }

    return response
  }

  public async getComponentData(
    message: MessageEvent<RPCMessage>,
  ): Promise<AccountsComponentData> {
    const accounts = await accountService.getAccounts(message.origin)
    console.log({ accounts })
    if (!accounts) {
      throw new GenericError("User data has not been found")
    }

    const baseData = await super.getComponentData(message)
    return {
      ...baseData,
      public: accounts.public,
      anonymous: accounts.anonymous,
    }
  }
}

export const icrc27AccountsMethodService = new Icrc27AccountsMethodService()
