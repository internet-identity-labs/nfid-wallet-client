import { ITab } from "@nfid-frontend/ui"

import { VaultsMembersPage } from "./members-page"

export const tabs: ITab[] = [
  {
    label: "Wallets",
    content: <div>wallets</div>,
    value: "wallets",
  },
  {
    label: "Members",
    content: <VaultsMembersPage />,
    value: "members",
  },
  {
    label: "Policies",
    content: <div>policies</div>,
    value: "policies",
  },
  {
    label: "Transactions",
    content: <div>transactions</div>,
    value: "transactions",
  },
]
