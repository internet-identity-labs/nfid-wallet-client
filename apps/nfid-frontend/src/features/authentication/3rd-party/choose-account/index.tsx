import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useCallback, useState } from "react"
import React from "react"
import { toast } from "react-toastify"
import useSWR from "swr"

import {
  BlurredLoader,
  IconCmpAnonymous,
  IconCmpInfo,
  Tooltip,
} from "@nfid-frontend/ui"
import {
  Account,
  ThirdPartyAuthSession,
  authState,
  authenticationTracking,
  getAnonymousDelegate,
} from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"
import { fetchAccountsService } from "frontend/integration/identity-manager/services"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { getLegacyThirdPartyAuthSession } from "../../services"
import { AuthAppMeta } from "../../ui/app-meta"
import { PublicProfileButton } from "../public-profile-button"

export interface IAuthChooseAccount {
  appMeta: AuthorizingAppMeta
  authRequest: AuthorizationRequest
  handleSelectAccount: (authSession: ThirdPartyAuthSession) => void
}

export const AuthChooseAccount = ({
  appMeta,
  authRequest,
  handleSelectAccount,
}: IAuthChooseAccount) => {
  const [isLoading, setIsLoading] = useState(false)
  console.debug("AuthChooseAccount", { appMeta })

  const { data: legacyAnonymousProfiles, isLoading: isAnonymousLoading } =
    useSWR([authRequest, "legacyAnonymousProfiles"], ([authRequest]) =>
      fetchAccountsService({ authRequest }),
    )

  React.useEffect(() => {
    if (!isAnonymousLoading) {
      authenticationTracking.profileSelectionLoaded({
        privateProfilesCount: legacyAnonymousProfiles?.length ?? 1,
      })
    }
  }, [legacyAnonymousProfiles, isAnonymousLoading])

  const handleSelectLegacyAnonymous = useCallback(
    async (account: Account) => {
      authenticationTracking.profileChosen({
        profile: `private-${parseInt(account.accountId) + 1}`,
      })
      setIsLoading(true)
      const authSession = await getLegacyThirdPartyAuthSession(
        authRequest,
        account.accountId,
      )

      handleSelectAccount(authSession)
    },
    [authRequest, handleSelectAccount],
  )

  const handleSelectAnonymous = useCallback(async () => {
    authenticationTracking.profileChosen({
      profile: "private-1",
    })
    setIsLoading(true)
    try {
      const delegation = authState.get().delegationIdentity
      if (!delegation) throw new Error("No delegation identity")

      const anonymousDelegation = await getAnonymousDelegate(
        authRequest.sessionPublicKey,
        delegation,
        authRequest.derivationOrigin ?? authRequest.hostname,
      )

      const authSession: ThirdPartyAuthSession = {
        anchor: (await fetchProfile()).anchor,
        signedDelegation: anonymousDelegation,
        userPublicKey: new Uint8Array(anonymousDelegation.publicKey),
        scope: "nfid.one",
      }

      handleSelectAccount(authSession)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [
    authRequest.derivationOrigin,
    authRequest.hostname,
    authRequest.sessionPublicKey,
    handleSelectAccount,
  ])

  if (isLoading || isAnonymousLoading) return <BlurredLoader isLoading />

  let appHost: string = ""
  try {
    appHost = new URL(authRequest.hostname ?? "").host
  } catch (e) {
    appHost = appMeta.name ?? ""
  }

  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appHost}
        applicationName={appMeta?.name}
        title="Choose a profile"
      />
      <div className="absolute right-5 top-2.5">
        <TooltipProvider>
          <Tooltip
            className="w-[368px]"
            tip={
              <div>
                <b>Public profiles</b> reveal cryptocurrency balances and
                activity, and allow applications to request payment. <br />
                <br />
                <span className="text-blue">{appHost}</span> does not support
                signing in with a public profile. <br />
                <br />
                <b>Anonymous profiles</b> hide your balance and activity across
                applications, and can’t approve payments.
              </div>
            }
          >
            <IconCmpInfo className="text-gray-400" />
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="w-full space-y-2.5 my-9">
        <PublicProfileButton />
        {legacyAnonymousProfiles?.map((acc) => (
          <div
            key={acc.label}
            className={clsx(
              "border border-gray-300 hover:border-blue-600 hover:bg-blue-50",
              "px-2.5 h-[70px] space-x-2.5 transition-all rounded-md cursor-pointer",
              "flex items-center hover:shadow-[0px_0px_2px_0px_#0E62FF] text-sm",
            )}
            onClick={() => handleSelectLegacyAnonymous(acc)}
          >
            <IconCmpAnonymous className="w-10 h-10" />
            <span>
              {appMeta.name} account {parseInt(acc.accountId) + 1}
            </span>
          </div>
        ))}
        {!legacyAnonymousProfiles?.length && (
          <div
            className={clsx(
              "border border-gray-300 hover:border-blue-600 hover:bg-blue-50",
              "px-2.5 h-[70px] space-x-2.5 transition-all rounded-md cursor-pointer",
              "flex items-center hover:shadow-[0px_0px_2px_0px_#0E62FF] text-sm",
            )}
            onClick={() => handleSelectAnonymous()}
          >
            <IconCmpAnonymous className="w-10 h-10" />
            <span>Anonymous {appMeta.name} profile</span>
          </div>
        )}
      </div>
      <div className="flex-1" />
      {/* Hide for this release */}
      {/* <Button type="ghost" block>
        Use a different NFID
      </Button> */}
    </>
  )
}
