import { IconCmpInfo, Tooltip } from "@nfid/ui"

interface RPCApplicationMetaSubtitleProps {
  applicationURL?: string
}
export const RPCApplicationMetaSubtitle = ({
  applicationURL,
}: RPCApplicationMetaSubtitleProps) => {
  return (
    <div className="flex items-center space-x-1">
      <span>Request from</span>
      <a
        className="text-blue hover:opacity-70"
        href={`https://${applicationURL}`}
        target="_blank"
        rel="noreferrer"
      >
        {applicationURL}
      </a>
      <Tooltip tip="Verify app url">
        <IconCmpInfo className="w-4 text-black" />
      </Tooltip>
    </div>
  )
}
