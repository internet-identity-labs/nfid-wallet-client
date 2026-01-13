import { ITab } from "@nfid/ui"

import { VaultsMembersPage } from "./members-page"
import { VaultsPoliciesPage } from "./policies-page"
import { VaultsTransactionsPage } from "./transactions-page"
import { VaultsWalletsPage } from "./wallets-page"

export const tabs: ITab[] = [
  {
    label: "Wallets",
    content: <VaultsWalletsPage />,
    value: "wallets",
  },
  {
    label: "Members",
    content: <VaultsMembersPage />,
    value: "members",
  },
  {
    label: "Policies",
    content: <VaultsPoliciesPage />,
    value: "policies",
  },
  {
    label: "Transactions",
    content: <VaultsTransactionsPage />,
    value: "transactions",
  },
]
