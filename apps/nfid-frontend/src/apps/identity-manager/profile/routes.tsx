import {
  KnowledgeIcon,
  SecurityIcon,
  VaultsIcon,
  WalletIcon,
} from "@nfid-frontend/ui"

export const ProfileConstants = {
  base: "/wallet",
  nftDetails: ":tokenId",
  tokens: "tokens",
  nfts: "nfts",
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
    icon: VaultsIcon,
    title: "Vaults",
    link: ProfileConstants.vaults,
    id: "nav-vaults",
    separator: true,
  },
  {
    icon: WalletIcon,
    title: "Wallet",
    link: `${ProfileConstants.base}/${ProfileConstants.tokens}`,
    id: "nav-assets",
    separator: true,
  },
  {
    icon: SecurityIcon,
    title: "Security",
    link: ProfileConstants.security,
    id: "nav-security",
  },
  {
    icon: KnowledgeIcon,
    title: "Knowledge base",
    link: `https://learn.nfid.one/`,
    id: "nav-knowledge-base",
    separator: true,
  },
]
