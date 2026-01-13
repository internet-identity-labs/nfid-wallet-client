import { NavAddressBookIcon } from "@nfid/ui/atoms/icons/nav-book"
import { NavPermissionsIcon } from "@nfid/ui/atoms/icons/nav-permissions"
import { NavSecurityIcon } from "@nfid/ui/atoms/icons/nav-security"
import { NavVaultsIcon } from "@nfid/ui/atoms/icons/nav-vaults"
import { NavWalletIcon } from "@nfid/ui/atoms/icons/nav-wallet"

export const ProfileConstants = {
  base: "/wallet",
  nftDetails: ":tokenId",
  tokens: "tokens",
  nfts: "nfts",
  staking: "staking",
  activity: "activity",
  security: "/security",
  permissions: "/permissions",
  addressBook: "/address-book",
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
    icon: NavAddressBookIcon,
    title: "Address book",
    link: ProfileConstants.addressBook,
    id: "nav-address-book",
  },
  {
    icon: NavSecurityIcon,
    title: "Security",
    link: ProfileConstants.security,
    id: "nav-security",
  },
  {
    icon: NavPermissionsIcon,
    title: "Permissions",
    link: ProfileConstants.permissions,
    id: "nav-permissions",
  },
]
