import clsx from "clsx"

import { H5, IconSvgNFIDWalletLogo } from "@nfid-frontend/ui"

export interface AuthAppMetaProps {
  applicationURL?: string
  title?: string
  subTitle?: string | JSX.Element
  withLogo?: boolean
}

export const AuthAppMeta: React.FC<AuthAppMetaProps> = ({
  applicationURL,
  subTitle = "Sign in to continue to",
  title,
  withLogo = true,
}) => (
  <>
    <div className="flex flex-col items-center w-full pt-8">
      {withLogo && <img src={IconSvgNFIDWalletLogo} className="h-[43px]" />}

      {title && (
        <H5
          className={clsx(
            "mt-5 mb-3 text-sm leading-6 text-black",
            !withLogo && "!text-[28px]",
          )}
        >
          {title}
        </H5>
      )}

      {applicationURL && (
        <div
          className={clsx(
            "flex items-center space-x-1 text-sm",
            withLogo && "mt-5",
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
