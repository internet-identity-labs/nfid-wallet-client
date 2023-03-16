import clsx from "clsx"

import { SDKApplicationMeta, Button } from "@nfid-frontend/ui"

import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCApplicationMetaSubtitle } from "../../ui/app-meta/subtitle"

interface IDefaultSign {
  onCancel: () => void
  onSign: () => void
  applicationMeta?: AuthorizingAppMeta
  data?: any
}

export const DefaultSign = ({
  onCancel,
  onSign,
  applicationMeta,
  data,
}: IDefaultSign) => {
  return (
    <div>
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
        {data}
      </div>
      <div className="flex items-center mt-2.5">
        <Button className="mr-2.5 w-full" type="stroke" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="w-full" onClick={onSign}>
          Sign
        </Button>
      </div>
    </div>
  )
}
