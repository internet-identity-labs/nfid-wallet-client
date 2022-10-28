import { Helmet } from "react-helmet-async"

import { RoutePhoneNumberVerification } from "./route"

interface PagePhoneNumberVerificationProps {}

export const PagePhoneNumberVerification: React.FC<
  PagePhoneNumberVerificationProps
> = () => {
  return (
    <RoutePhoneNumberVerification>
      <Helmet>
        <title>NFIDemo | Phone number verification</title>
      </Helmet>
    </RoutePhoneNumberVerification>
  )
}
