import clsx from "clsx"

import { H5, IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"

export interface AuthAppMetaProps {
  applicationLogo?: string
  applicationURL?: string
  applicationName?: string
  title?: string
  subTitle?: string | JSX.Element
  withMargin?: boolean
}

export const AuthAppMeta: React.FC<AuthAppMetaProps> = ({
  applicationURL,
  subTitle = "Sign in to continue to",
  title,
  withMargin = true,
}) => (
  <>
    <div className="flex flex-col items-center w-full pt-8">
      <img src={IconSvgNFIDWalletLogo} className="h-[43px]" />

      {title && (
        <H5 className="mt-5 mb-3 text-sm leading-6 text-black">{title}</H5>
      )}

      {applicationURL && (
        <div
          className={clsx(
            "flex items-center space-x-1 text-sm",
            withMargin && "mt-5",
          )}
        >
          <span>
            {subTitle}{" "}
            <a
              className="transition-opacity text-[#146F68] hover:opacity-50"
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
