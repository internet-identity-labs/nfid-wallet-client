import clsx from "clsx"
import React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { ImageNFIDLogin } from "frontend/flows/screens-app/authenticate/image"
import { ProfileConstants as AppScreenProfile } from "frontend/flows/screens-app/profile/routes"
import { IFrameAuthorizeAppConstants as IFrameAuthorize } from "frontend/flows/screens-iframe/authorize-app/routes"
import { IFrameProfileConstants as IFrameProfile } from "frontend/flows/screens-iframe/personalize/routes"
import { useAuthentication } from "frontend/hooks/use-authentication"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { Loader, P } from "frontend/ui-kit/src"

import { Button } from "components/atoms/button"
import { H2, H5 } from "components/atoms/typography"

interface AuthenticateNFIDLoginContentProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  iframe?: boolean
}

export const AuthenticateNFIDLoginContent: React.FC<
  AuthenticateNFIDLoginContentProps
> = ({ iframe }) => {
  const params = useParams()
  console.log(">> AuthenticateNFIDLoginContent", { params, iframe })

  const { account } = useAccount()
  const { isLoading, error, login } = useAuthentication()
  const navigate = useNavigate()

  const handleUnlock = React.useCallback(async () => {
    const response = await login()

    // TODO: check for response codes
    if (response?.tag === "ok") {
      // TODO: refresh account when authenticated
      // currently broken because of different principalId
      // const accountResponse = await readAccount(response.identityManager)
      // console.log(">> handleUnlock", { accountResponse })

      // TODO: fix navigate on both if statements
      if (account && account.skipPersonalize) {
        // TODO: figure out if we really need to navigate here.
        // Normally as this is a AuhtWrapper, it should not be necessary at this point!
        iframe && navigate(IFrameAuthorize.base)
      }

      if (account && !account.skipPersonalize) {
        iframe
          ? navigate(`${IFrameProfile.base}/${IFrameProfile.personalize}`, {
              state: params,
            })
          : navigate(
              `${AppScreenProfile.base}/${AppScreenProfile.personalize}`,
              {
                state: params,
              },
            )
      }
    }
  }, [account, iframe, login, navigate, params])

  const title = "Unlock your NFID"

  return (
    <>
      <div>
        {iframe ? (
          <H5 className="mb-3">{title}</H5>
        ) : (
          <H2 className="my-6">{title}</H2>
        )}

        <P>
          The NFID on this device can only be unlocked by{" "}
          {account?.name || account?.anchor}.
        </P>
        <Button
          large={!iframe}
          block={iframe}
          secondary
          className="mt-8"
          onClick={handleUnlock}
        >
          Unlock as {account?.name || account?.anchor}
        </Button>

        {error && (
          <div className={clsx("text-sm mt-2 text-red-base")}>{error}</div>
        )}

        <Loader isLoading={isLoading} iframe={iframe} />
      </div>

      <ImageNFIDLogin />
    </>
  )
}
