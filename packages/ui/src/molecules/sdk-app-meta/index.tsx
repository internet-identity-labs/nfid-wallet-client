import { ApplicationLogo } from "../../atoms/application-logo"
import { H5 } from "../../atoms/typography"
import { P } from "../../atoms/typography/paragraph"

interface SDKApplicationMetaProps {
  applicationLogo?: string
  applicationName?: string
  title?: string
  subTitle?: string
}

export const SDKApplicationMeta: React.FC<SDKApplicationMetaProps> = ({
  applicationLogo,
  applicationName,
  title,
  subTitle,
}) => (
  <div className="flex flex-col items-center">
    {applicationLogo && (
      <ApplicationLogo
        src={applicationLogo}
        applicationName={applicationName}
      />
    )}
    <H5>{title}</H5>
    <P className="mt-2">{subTitle}</P>
  </div>
)
