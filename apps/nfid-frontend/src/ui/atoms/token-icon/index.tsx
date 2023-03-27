import clsx from "clsx"

import { Image } from "@nfid-frontend/ui"

export const TokenIcon: React.FC<{ src: string; token: string }> = ({
  src,
  token,
}) => {
  return (
    <Image
      src={src}
      alt={`token-icon-${token}`}
      className={clsx("w-10 h-10")}
    />
  )
}
