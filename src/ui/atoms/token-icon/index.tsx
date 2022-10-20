import clsx from "clsx"

export const TokenIcon: React.FC<{ src: string; token: string }> = ({
  src,
  token,
}) => {
  return (
    <img src={src} alt={`token-icon-${token}`} className={clsx("w-10 h-10")} />
  )
}
