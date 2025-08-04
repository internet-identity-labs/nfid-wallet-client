import { NavSecurityIcon } from "packages/ui/src/atoms/icons/nav-security"
import { NavVaultsIcon } from "packages/ui/src/atoms/icons/nav-vaults"
import { NavWalletIcon } from "packages/ui/src/atoms/icons/nav-wallet"

export const ProfileConstants = {
  base: "/wallet",
  nftDetails: ":tokenId",
  tokens: "tokens",
  nfts: "nfts",
  staking: "staking",
  activity: "activity",
  security: "/security",
  copyRecoveryPhrase: "/copy-recovery-phrase",
  addPhoneNumber: "/add-phone-number",
  vaults: "/vaults",
  vault: ":vaultId",
  vaultTransaction: ":transactionId",
}

export const navigationPopupLinks = [
  {
    icon: NavVaultsIcon,
    title: "Vaults",
    link: ProfileConstants.vaults,
    id: "nav-vaults",
    separator: true,
  },
  {
    icon: NavWalletIcon,
    title: "Wallet",
    link: `${ProfileConstants.base}/${ProfileConstants.tokens}`,
    id: "nav-assets",
    separator: true,
  },
  {
    icon: NavSecurityIcon,
    title: "Security",
    link: ProfileConstants.security,
    id: "nav-security",
  },
]
