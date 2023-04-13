import clsx from "clsx"

import { SDKApplicationMeta, Button } from "@nfid-frontend/ui"

import { RPCApplicationMetaSubtitle } from "frontend/features/embed-controller/ui/app-meta/subtitle"
import { AuthorizingAppMeta } from "frontend/state/authorization"

interface IObject {
  account: string
  value: string
}

interface ISignTypedData {
  applicationMeta: AuthorizingAppMeta
  royalties: IObject[]
  creators: IObject[]
  tokenId: string
  tokenURI: string
  onApprove: () => void
  onCancel: () => void
}

export const SignTypedData: React.FC<ISignTypedData> = ({
  applicationMeta,
  royalties,
  creators,
  tokenId,
  tokenURI,
  onApprove,
  onCancel,
}: ISignTypedData) => {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <SDKApplicationMeta
          title="Signature"
          applicationLogo={applicationMeta?.logo}
          subTitle={
            <RPCApplicationMetaSubtitle applicationURL={applicationMeta?.url} />
          }
        />
        <p className="text-sm my-3.5">
          Only sign this message if you fully understand the content and trust
          the requesting site.
        </p>
        <div
          className={clsx(
            "rounded-md bg-gray-50 px-3.5 py-2.5 flex-1 space-y-3",
            "text-gray-500 break-all text-sm",
          )}
        >
          {royalties?.length ? <p className="font-bold">Royalties</p> : null}
          {royalties.map((object) => (
            <div
              key={`royalty_${object.account}`}
              className="pl-2.5 grid grid-cols-[90px,1fr] gap-2.5"
            >
              <span>Account</span>
              <span className="text-black">{object.account}</span>
              <span>Value</span>
              <span className="text-black">{object.value}</span>
            </div>
          ))}
          {creators.length ? <p className="font-bold">Creators</p> : null}
          {creators.map((object) => (
            <div
              key={`creator_${object.account}`}
              className="pl-2.5 grid grid-cols-[90px,1fr] gap-2.5"
            >
              <span>Account</span>
              <span className="text-black">{object.account}</span>
              <span>Value</span>
              <span className="text-black">{object.value}</span>
            </div>
          ))}
          <div className="flex space-x-2.5">
            <span className="w-[100px] shrink-0">Token ID</span>
            <span className="text-black">{tokenId}</span>
          </div>
          <div className="flex space-x-2.5">
            <span className="w-[100px] shrink-0">Token URI</span>
            <span className="text-black">{tokenURI}</span>
          </div>
        </div>
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
