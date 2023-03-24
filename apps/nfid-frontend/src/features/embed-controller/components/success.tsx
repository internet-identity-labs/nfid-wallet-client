import clsx from "clsx"
import { useMemo } from "react"

import { Button, ImagePngSuccess } from "@nfid-frontend/ui"

interface ISuccessComponent {
  onClose: () => void
  method?: string
  itemName?: string
}

export const SuccessComponent = ({
  onClose,
  method,
  itemName,
}: ISuccessComponent) => {
  const message = useMemo(() => {
    switch (method) {
      case "BUY":
        return `You just bought “${itemName}”`
      case "SELL":
        return `You just sold “${itemName}”`
      case "MINT":
      case "LAZY_MINT":
        return `You've just minted a new NFT`
    }
  }, [itemName, method])

  return (
    <div
      className={clsx(
        "text-black text-center",
        "flex flex-grow flex-col justify-between",
      )}
    >
      <div className="flex-grow">
        <img
          className="w-[240px] mx-auto"
          src={ImagePngSuccess}
          alt="success"
        />
        <p className="text-xl font-bold">Transaction successful</p>
        <p className="font-bold mt-[10px] mb-3">{message}</p>
      </div>
      <Button className="w-full mt-[36px]" onClick={onClose}>
        Close
      </Button>
    </div>
  )
}
