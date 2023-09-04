import clsx from "clsx"

import { H5, IconSvgID, IconSvgNFID } from "@nfid-frontend/ui"

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
  title = "Use NFID",
  subTitle = "to connect to",
}) => (
  <>
    <div className="flex flex-col items-center w-full pt-8">
      {applicationLogo ? (
        <div className="relative h-[54px] w-[84px] shadow-sm rounded-xl">
          <img
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
            <img
              className="h-full"
              src={IconSvgID}
              alt={`application-logo-NFID`}
            />
          </div>
        </div>
      ) : (
        <img
          src={IconSvgNFID}
          alt={`application-logo-${applicationName}`}
          className="h-[54px]"
        />
      )}

      <H5 className="mt-4 mb-2 text-sm leading-6 text-black">{title}</H5>

      {applicationURL && (
        <div className="flex items-center space-x-1 text-sm">
          <span>
            {subTitle}{" "}
            <a
              className="transition-opacity text-linkColor hover:opacity-50"
              href={`https://${applicationURL}`}
              target="_blank"
              rel="noreferrer"
            >
              {applicationURL}
            </a>
          </span>
        </div>
      )}
    </div>
  </>
)
