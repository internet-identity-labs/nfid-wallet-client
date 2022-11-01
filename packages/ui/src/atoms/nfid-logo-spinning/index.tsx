import loader from "./loader.webp"

interface NFIDLogoSpinningProps {
  className: string
}

export const NFIDLogoSpinning: React.FC<NFIDLogoSpinningProps> = ({
  className,
}) => {
  return <img src={loader} className={className} />
}
