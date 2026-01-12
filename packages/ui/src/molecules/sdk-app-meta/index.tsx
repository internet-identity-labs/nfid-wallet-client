import { ApplicationLogo } from "../../atoms/application-logo"
import { H5 } from "../../atoms/typography"

export interface SDKApplicationMetaProps {
  applicationLogo?: string
  applicationName?: string
  title?: string
  subTitle?: string | JSX.Element
}

export const SDKApplicationMeta: React.FC<SDKApplicationMetaProps> = ({
  applicationLogo,
  applicationName,
  title,
  subTitle,
}) => (
  <>
    <div className="flex items-center space-x-2.5">
      {applicationLogo ? (
        <ApplicationLogo
          src={applicationLogo}
          applicationName={applicationName}
        />
      ) : null}
      <H5 className="">{title}</H5>
    </div>
    <div className="mt-2 mb-3 text-sm leading-6 text-black">{subTitle}</div>
  </>
)
