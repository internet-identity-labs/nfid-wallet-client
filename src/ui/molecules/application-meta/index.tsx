import { ApplicationLogo } from "frontend/ui/atoms/application-logo"
import { H5 } from "frontend/ui/atoms/typography"
import { P } from "frontend/ui/atoms/typography/paragraph"

interface ApplicationMetaProps {
  applicationLogo?: string
  applicationName?: string
  title?: string
  subTitle?: string
}
export const ApplicationMeta: React.FC<ApplicationMetaProps> = ({
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
