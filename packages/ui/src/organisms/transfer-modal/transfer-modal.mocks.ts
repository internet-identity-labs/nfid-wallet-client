import { Principal } from "@dfinity/principal"

import { IWallet } from "./types"

export const mockToPresentation = (value = BigInt(0)) => Number(value) / 10 ** 8

export const WALLETS: IWallet[] = [
  {
    label: "Wallet 1",
    principal: Principal.fromText(
      "gv5fe-6s7su-pgeqr-2wizb-t3suu-7kayl-vqxah-3yyia-ezheu-uovga-rqe",
    ),
    accountId: "0",
    domain: "nfid.one",
    balance: BigInt(10000),
  },
  {
    label: "Wallet 2",
    principal: Principal.fromText(
      "b27e3-f3kqs-v4awo-5naps-qdb2x-6pi6t-elxdc-snwxn-nz3jd-3445f-5qe",
    ),
    accountId: "0",
    domain: "another-domain.com",
    balance: BigInt(20000),
  },
]

export const WALLET_OPTIONS = WALLETS.map((wallet) => ({
  label: wallet.label ?? "",
  value: wallet.principal?.toText() ?? "",
  afterLabel: `${mockToPresentation(wallet.balance)} ICP`,
}))
