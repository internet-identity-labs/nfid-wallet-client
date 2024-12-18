import { ImSpinner } from "react-icons/im"

import { Copy } from "../../atoms/copy"
import { Button } from "../../molecules/button"

export interface IIAuthCodeProps {
  secureCode: string
  anchor?: number
  onCancel: () => void
  isLoading?: boolean
}

export const IIAuthCode = ({
  secureCode,
  anchor,
  onCancel,
  isLoading,
}: IIAuthCodeProps) => {
  return (
    <div>
      <p className="mb-5 font-bold tracking-[0.01em]">
        Connect Internet Identity
      </p>
      <p className="">
        Secure the connection to anchor {anchor} with this verification code:
      </p>
      <div className="bg-gradient-to-b from-[#EFF6FF] to-white-100 h-64 my-5 rounded-md p-5">
        <div className="text-[34px] w-full">
          <div className="grid grid-cols-6">
            {secureCode.split("").map((char, index) => (
              <div key={`code_${index}`} className="text-center">
                {char}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4 item-center">
            <Copy
              value={secureCode}
              className="h-[18px] flex-shrink-0"
              iconClassName="text-secondary"
              copyTitle="Click to copy"
            />
          </div>
        </div>
      </div>
      <Button
        type={isLoading ? "primary" : "stroke"}
        block
        onClick={onCancel}
        disabled={isLoading}
        icon={isLoading ? <ImSpinner className="animate-spin" /> : undefined}
      >
        {isLoading ? "Connecting..." : "Cancel"}
      </Button>
    </div>
  )
}
