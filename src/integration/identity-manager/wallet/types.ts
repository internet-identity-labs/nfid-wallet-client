import { Principal } from "@dfinity/principal"

import { Balance } from "frontend/integration/rosetta/rosetta_interface"

export interface IWallet {
  label?: string
  principal?: Principal
  accountId: string
  domain: string
  balance?: Balance
}
