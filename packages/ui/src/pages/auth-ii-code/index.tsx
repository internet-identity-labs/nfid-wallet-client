import { Button } from "../../atoms/button"
import { Copy } from "../../atoms/copy"

export interface IIAuthCodeProps {
  secureCode: string
  anchor?: number
  onCancel: () => void
}

export const IIAuthCode = ({
  secureCode,
  anchor,
  onCancel,
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
            {secureCode.split("").map((char) => (
              <div className="text-center">{char}</div>
            ))}
          </div>

          <div className="flex justify-center mt-4 item-center">
            <Copy
              value={secureCode}
              className="h-[18px] flex-shrink-0"
              iconClassName="stroke-gray-400"
              copyTitle="Click to copy"
            />
          </div>
        </div>
      </div>
      <Button stroke block onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}
