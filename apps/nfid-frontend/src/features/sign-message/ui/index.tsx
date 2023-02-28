import { TooltipProvider } from "@radix-ui/react-tooltip"

import {
  SDKApplicationMeta,
  IconCmpInfo,
  Button,
  Tooltip,
  BlurredLoader,
} from "@nfid-frontend/ui"

interface ISignMessage {
  onCancel: () => void
  onSign: () => void
  applicationLogo?: string
  applicationURL?: string
  isLoading: boolean
}

export const SignMessage = ({
  onCancel,
  onSign,
  applicationLogo,
  applicationURL,
  isLoading,
}: ISignMessage) => {
  return (
    <BlurredLoader isLoading={isLoading} className="flex flex-col p-0">
      <TooltipProvider>
        <SDKApplicationMeta
          title="Signature"
          applicationLogo={applicationLogo}
          subTitle={
            <div className="flex items-center space-x-1">
              <span>to connect to</span>
              <a
                className="text-blue hover:opacity-70"
                href={`https://${applicationURL}`}
                target="_blank"
                rel="noreferrer"
              >
                {applicationURL}
              </a>
              <Tooltip tip="123">
                <IconCmpInfo className="w-4 text-gray-400" />
              </Tooltip>
            </div>
          }
        />
        <p className="text-sm my-3.5">
          Only sign this message if you fully understand the content and trust
          the requesting site.
        </p>
        <div className="rounded-md bg-gray-50 px-3.5 py-2.5 text-sm flex-1">
          I want to login on Rarible at 2023-02-09T10:12:58.918Z. I accept the
          Rarible Terms of Service http://static.rarible.com/terms.pdf and I am
          at least 13 years old.
        </div>
        <div className="flex items-center mt-2.5">
          <Button className="mr-2.5 w-full" type="stroke" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="w-full" onClick={onSign}>
            Sign
          </Button>
        </div>
      </TooltipProvider>
    </BlurredLoader>
  )
}
