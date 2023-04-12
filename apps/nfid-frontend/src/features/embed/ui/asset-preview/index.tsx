import { BatchAssetPreview } from "./batch"
import { SingleAssetPreview } from "./single"

export interface IAsset {
  icon?: string
  title?: string
  subtitle?: string
  innerTitle?: string
  innerSubtitle?: string
}
interface IAssetPreview {
  assets?: IAsset[]
}

export const AssetPreview = ({ assets }: IAssetPreview) => {
  if (
    !assets ||
    (assets.length === 1 &&
      !assets[0]?.icon &&
      !assets[0]?.subtitle &&
      !assets[0]?.title)
  )
    return null
  if (assets.length === 1) return <SingleAssetPreview {...assets[0]} />
  if (assets.length > 1) return <BatchAssetPreview assets={assets} />

  return null
}
