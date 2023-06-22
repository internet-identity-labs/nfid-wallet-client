import { ApplicationLogo } from "packages/ui/src/atoms/application-logo"

import { H5, IconSvgID, IconSvgNFID, Image } from "@nfid-frontend/ui"

export interface AuthAppMetaProps {
  applicationLogo?: string
  applicationName?: string
  title?: string
  subTitle?: string | JSX.Element
}

export const AuthAppMeta: React.FC<AuthAppMetaProps> = ({
  applicationLogo,
  applicationName,
  title,
  subTitle,
}) => (
  <>
    <div className="flex flex-col items-center w-full mb-5">
      <Image
        src={IconSvgNFID}
        alt={`application-logo-${applicationName}`}
        className="h-[46px]"
      />

      <H5 className="mt-2 mb-3 text-sm leading-6 text-black">{title}</H5>
    </div>
  </>
)
