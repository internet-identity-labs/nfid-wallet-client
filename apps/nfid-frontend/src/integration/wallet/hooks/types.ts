import { Principal } from "@dfinity/principal"
import { Balance } from "@nfid/integration"

export interface IWallet {
  label?: string
  principal?: Principal
  accountId: string
  domain: string
  balance?: Balance
}
