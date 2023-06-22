import clsx from "clsx"

import {
  H5,
  IconCmpInfo,
  IconSvgID,
  IconSvgNFID,
  Image,
  Tooltip,
} from "@nfid-frontend/ui"

export interface AuthAppMetaProps {
  applicationLogo?: string
  applicationURL?: string
  applicationName?: string
  title?: string
  subTitle?: string | JSX.Element
}

export const AuthAppMeta: React.FC<AuthAppMetaProps> = ({
  applicationLogo,
  applicationURL,
  applicationName,
  title,
  subTitle,
}) => (
  <>
    <div className="flex flex-col items-center w-full pt-8">
      {applicationLogo ? (
        <div className="relative h-[54px] w-[84px] shadow-sm rounded-xl">
          <Image
            src={applicationLogo}
            alt={`application-logo-${applicationName}`}
            className="absolute top-0 right-0 z-10 h-full"
          />
          <div
            className={clsx(
              "absolute top-0 left-0 z-20 h-full p-1 rounded-xl",
              "bg-white bg-opacity-90 backdrop-blur-sm",
            )}
          >
            <Image
              className="h-full"
              src={IconSvgID}
              alt={`application-logo-NFID`}
            />
          </div>
        </div>
      ) : (
        <Image
          src={IconSvgNFID}
          alt={`application-logo-${applicationName}`}
          className="h-[54px]"
        />
      )}

      <H5 className="mt-5 mb-3 text-sm leading-6 text-black">
        {applicationURL ? "Use NFID" : title}
      </H5>

      {applicationURL && (
        <div className="flex items-center space-x-1 text-sm">
          <span>
            to connect to{" "}
            <a
              className="transition-opacity text-blue hover:opacity-50"
              href={applicationURL}
              target="_blank"
              rel="noreferrer"
            >
              {new URL(applicationURL).host}
            </a>
          </span>
          <Tooltip
            className="w-[368px] text-white text-sm leading-5 font-normal"
            tip={
              "By connecting, you share the blockchain addresses associated with your NFID. Your email address is never shared with anyone — it stays encrypted in your identity."
            }
          >
            <IconCmpInfo className="w-[18px] h-[18px]" />
          </Tooltip>
        </div>
      )}
    </div>
  </>
)
