import { Image } from "@nfid-frontend/ui"

import loader from "./loader.webp"

interface NFIDLogoSpinningProps {
  className: string
}

export const NFIDLogoSpinning: React.FC<NFIDLogoSpinningProps> = ({
  className,
}) => {
  return <Image src={loader} className={className} />
}
