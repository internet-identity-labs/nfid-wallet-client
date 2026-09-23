/* eslint-disable @nx/enforce-module-boundaries */
import clsx from "clsx"
import { A } from "packages/ui/src/atoms/custom-link"

import { H5, LogoMain, LogoLanding } from "@nfid-frontend/ui"
import { JSX } from "react"

import { useDarkTheme } from "frontend/hooks"

export interface AuthAppMetaProps {
  applicationURL?: string
  title?: string
  subTitle?: string | JSX.Element
  withLogo?: boolean
  isIdentityKit?: boolean
}

export const AuthAppMeta: React.FC<AuthAppMetaProps> = ({
  applicationURL,
  subTitle = "Connect to",
  title = "Connect to",
  withLogo = true,
  isIdentityKit,
}) => {
  const isDarkTheme = useDarkTheme()

  return (
    <>
      <div className="flex flex-col items-center w-full pt-8 pb-[30px] dark:text-white">
        {withLogo && (
          <img
            src={isDarkTheme ? LogoLanding : LogoMain}
            className="h-[43px]"
          />
        )}

        {title && isIdentityKit && (
          <H5
            className={clsx(
              "mt-5 mb-3 text-sm leading-6 text-black dark:text-white",
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
            <span className="text-center">
              {subTitle}{" "}
              <A href={applicationURL} target="_blank" rel="noreferrer">
                {applicationURL}
              </A>
            </span>
          </div>
        )}
      </div>
    </>
  )
}
