import clsx from "clsx"

import { SDKApplicationMeta, Button } from "@nfid-frontend/ui"

import { RPCApplicationMetaSubtitle } from "frontend/features/embed-controller/ui/app-meta/subtitle"
import { AuthorizingAppMeta } from "frontend/state/authorization"

interface IPersonalSign {
  applicationMeta: AuthorizingAppMeta
  message: string
  onApprove: () => void
  onCancel: () => void
}

export const PersonalSign: React.FC<IPersonalSign> = ({
  applicationMeta,
  message,
  onApprove,
  onCancel,
}: IPersonalSign) => {
  return (
    <div className="flex flex-col justify-between flex-1">
      <SDKApplicationMeta
        title="Signature"
        applicationLogo={applicationMeta?.logo}
        subTitle={
          <RPCApplicationMetaSubtitle applicationURL={applicationMeta?.url} />
        }
      />
      <p className="text-sm my-3.5">
        Only sign this message if you fully understand the content and trust the
        requesting site.
      </p>
      <div
        className={clsx(
          "rounded-md bg-gray-50 px-3.5 py-2.5 flex-1 space-y-2",
          "text-gray-500 break-all text-sm",
        )}
      >
        {message}
      </div>

      <div className="pt-5">
        <div className="flex items-center w-full space-x-2.5">
          <Button type="stroke" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" className="w-full" onClick={onApprove}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
