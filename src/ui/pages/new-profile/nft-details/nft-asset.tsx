import { DisplayFormat } from "frontend/integration/entrepot/types"

export const NFTAsset = (assetFullsize: {
  url: string
  format: DisplayFormat
}) => {
  switch (assetFullsize.format) {
    case "img":
      return (
        <div
          style={{ backgroundImage: `url(${assetFullsize.url})` }}
          className="relative z-20 h-full bg-center bg-no-repeat bg-contain"
        />
      )
    case "iframe":
      return (
        <iframe
          title="nft"
          frameBorder="0"
          src={assetFullsize.url}
          alt=""
          style={{
            zIndex: "20",
            border: "none",
            height: "100%",
            width: "100%",
            display: "block",
          }}
        />
      )
    default:
      return (
        <div
          style={{ backgroundImage: `url(${assetFullsize.url})` }}
          className="relative z-20 h-full bg-center bg-no-repeat bg-contain"
        />
      )
  }
}
