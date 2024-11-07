import { AssetPreview } from "frontend/integration/nft/impl/nft-types"

export interface IGroupOption {
  title: string
  subTitle?: string
  innerTitle?: string
  innerSubtitle?: string
  icon?: AssetPreview | null
  value: string
  badgeText?: string
}

export interface IGroupedOptions {
  label: string
  options: IGroupOption[]
}
