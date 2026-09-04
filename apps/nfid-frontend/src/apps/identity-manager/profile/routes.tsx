import { NavSecurityIcon } from "packages/ui/src/atoms/icons/nav-security"
import { NavPermissionsIcon } from "packages/ui/src/atoms/icons/nav-permissions"
import { NavOpenCryptopayIcon } from "packages/ui/src/atoms/icons/nav-open-cryptopay"
import { NavDiscoveryIcon } from "packages/ui/src/atoms/icons/nav-discovery"
import { NavVaultsIcon } from "packages/ui/src/atoms/icons/nav-vaults"
import { NavWalletIcon } from "packages/ui/src/atoms/icons/nav-wallet"
import { NavAddressBookIcon } from "packages/ui/src/atoms/icons/nav-book"
import { NavViewOnlyIcon } from "packages/ui/src/atoms/icons/nav-view-only"
import { NavPrivateAccountsIcon } from "packages/ui/src/atoms/icons/nav-private-accounts"

export const ProfileConstants = {
  base: "/wallet",
  nftDetails: ":tokenId",
  privateAccountsDetails: ":dappId",
  privateAccounts: "/private-accounts",
  tokens: "tokens",
  nfts: "nfts",
  staking: "staking",
  earn: "earn",
  activity: "activity",
  security: "/security",
  permissions: "/permissions",
  addressBook: "/address-book",
  discovery: "/discovery",
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
  {
    icon: NavPermissionsIcon,
    title: "Permissions",
    link: ProfileConstants.permissions,
    id: "nav-permissions",
  },
  {
    icon: NavAddressBookIcon,
    title: "Address book",
    link: ProfileConstants.addressBook,
    id: "nav-address-book",
  },
  {
    icon: NavDiscoveryIcon,
    title: "Discovery",
    link: ProfileConstants.discovery,
    id: "nav-discovery",
  },
  {
    icon: NavPrivateAccountsIcon,
    title: "Private accounts",
    link: ProfileConstants.privateAccounts,
    id: "nav-private-accounts",
  },
  {
    icon: NavOpenCryptopayIcon,
    title: "Open CryptoPay",
    link: "",
    id: "nav-open-cryptopay",
  },
  {
    icon: NavViewOnlyIcon,
    title: "View-only mode",
    link: "",
    id: "nav-view-only",
  },
]
