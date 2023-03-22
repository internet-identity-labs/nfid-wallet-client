import clsx from "clsx"

import { SDKApplicationMeta, Button } from "@nfid-frontend/ui"

import { AuthorizingAppMeta } from "frontend/state/authorization"

import { RPCApplicationMetaSubtitle } from "../ui/app-meta/subtitle"
import { ApproverCmpProps } from "./types"

interface ILazyMintComponent {
  onCancel: () => void
  onSign: () => void
  applicationMeta?: AuthorizingAppMeta
  data?: any
}

export const LazyMintComponent = ({
  onCancel,
  onSign,
  applicationMeta,
  data,
}: ILazyMintComponent) => {
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
        <p className="font-bold">Royalties</p>
        <div className="flex space-x-2.5 pl-2.5">
          <span className="w-[100px] shrink-0">Account</span>
          <span className="text-black">{data?.creators[0].account}</span>
        </div>
        <div className="flex space-x-2.5 pl-2.5">
          <span className="w-[100px] shrink-0">Value</span>
          <span className="text-black">{data?.creators[0].value}</span>
        </div>
        <p className="font-bold">Creators</p>
        <div className="flex space-x-2.5 pl-2.5">
          <span className="w-[100px] shrink-0">Account</span>
          <span className="text-black">{data?.creators[0].account}</span>
        </div>
        <div className="flex space-x-2.5 pl-2.5">
          <span className="w-[100px] shrink-0">Value</span>
          <span className="text-black">{data?.creators[0].value}</span>
        </div>
        <div className="flex space-x-2.5">
          <span className="w-[100px] shrink-0">Token ID</span>
          <span className="text-black">{data?.tokenId}</span>
        </div>
        <div className="flex space-x-2.5">
          <span className="w-[100px] shrink-0">Token URI</span>
          <span className="text-black">/ipfs/{data?.tokenURI}</span>
        </div>
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
const MappedLazyMintComponent: React.FC<ApproverCmpProps> = ({
  appMeta,
  rpcMessageDecoded,
  onConfirm,
  onReject,
}) => {
  return (
    <LazyMintComponent
      applicationMeta={appMeta}
      onSign={onConfirm}
      onCancel={onReject}
      data={rpcMessageDecoded?.data}
    />
  )
}
export default MappedLazyMintComponent
