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
  <>
    <div className="flex items-center space-x-2.5">
      {applicationLogo && (
        <ApplicationLogo
          src={applicationLogo}
          applicationName={applicationName}
        />
      )}
      <H5 className="">{title}</H5>
    </div>
    <P className="mt-4 text-sm">{subTitle}</P>
  </>
)
