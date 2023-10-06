import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useCallback, useMemo, useState } from "react"
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
  getPublicAccountDelegate,
} from "@nfid/integration"

import { RequestStatus } from "frontend/features/types"
import { fetchProfile } from "frontend/integration/identity-manager"
import { fetchAccountsService } from "frontend/integration/identity-manager/services"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { getLegacyThirdPartyAuthSession } from "../../services"
import { AuthAppMeta } from "../../ui/app-meta"
import { PublicProfileButton } from "../public-profile-button"
import { ApproveIcGetDelegationSdkResponse } from "./types"

export interface IAuthChooseAccount {
  appMeta: AuthorizingAppMeta
  authRequest: AuthorizationRequest
  handleSelectAccount: (data: ApproveIcGetDelegationSdkResponse) => void
}

const HOT_FIX_V24_1_WRONG_HOSTNAMES = [
  "https://playground-dev.nfid.one",
  "https://dscvr.one",
  "https://hotornot.wtf",
  "https://awcae-maaaa-aaaam-abmyq-cai.icp0.io", // BOOM DAO
  "https://7p3gx-jaaaa-aaaal-acbda-cai.raw.ic0.app", // BOOM DAO
  "https://scifi.scinet.one",
  "https://oc.app",
  "https://signalsicp.com",
  "https://n7z64-2yaaa-aaaam-abnsa-cai.icp0.io", // BOOM DAO
  "https://nuance.xyz",
  "https://h3cjw-syaaa-aaaam-qbbia-cai.ic0.app", // The Asset App
  "https://trax.so",
  "https://jmorc-qiaaa-aaaam-aaeda-cai.ic0.app", // Unfold VR
  "https://65t4u-siaaa-aaaal-qbx4q-cai.ic0.app", // my-icp-app
]

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

  const isDerivationBug = useMemo(() => {
    return HOT_FIX_V24_1_WRONG_HOSTNAMES.includes(authRequest.hostname)
  }, [authRequest.hostname])

  const handleSelectLegacyAnonymous = useCallback(
    async (account: Account) => {
      setIsLoading(true)
      try {
        authenticationTracking.profileChosen({
          profile: `private-${parseInt(account.accountId) + 1}`,
        })

        const authSession = await getLegacyThirdPartyAuthSession(
          authRequest,
          account.accountId,
        )

        handleSelectAccount({
          status: RequestStatus.SUCCESS,
          authSession,
        })
      } catch (e: any) {
        console.error(e)
        toast.error(e.message)
        handleSelectAccount({
          status: RequestStatus.ERROR,
          errorMessage: e.message,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [authRequest, handleSelectAccount],
  )

  const handleSelectAnonymous = useCallback(
    async (useHostName = false) => {
      authenticationTracking.profileChosen({
        profile: "private-1",
      })
      setIsLoading(true)
      try {
        const delegation = authState.get().delegationIdentity
        if (!delegation) throw new Error("No delegation identity")

        const domain = useHostName
          ? authRequest.hostname
          : authRequest.derivationOrigin ?? authRequest.hostname

        const anonymousDelegation = await getAnonymousDelegate(
          authRequest.sessionPublicKey,
          delegation,
          domain,
        )

        const authSession: ThirdPartyAuthSession = {
          anchor: (await fetchProfile()).anchor,
          signedDelegation: anonymousDelegation,
          userPublicKey: new Uint8Array(anonymousDelegation.publicKey),
          scope: domain,
        }

        handleSelectAccount({
          status: RequestStatus.SUCCESS,
          authSession,
        })
      } catch (e: any) {
        console.error(e)
        toast.error(e.message)
        handleSelectAccount({
          status: RequestStatus.ERROR,
          errorMessage: e.message,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      authRequest.derivationOrigin,
      authRequest.hostname,
      authRequest.sessionPublicKey,
      handleSelectAccount,
    ],
  )

  const handleSelectPublic = useCallback(async () => {
    authenticationTracking.profileChosen({
      profile: "public",
    })
    setIsLoading(true)

    try {
      const delegation = authState.get().delegationIdentity
      if (!delegation) throw new Error("No delegation identity")
      if (!authRequest.targets) throw new Error("No targets")

      const publicDelegation = await getPublicAccountDelegate(
        authRequest.sessionPublicKey,
        delegation,
        authRequest.derivationOrigin ?? authRequest.hostname,
        authRequest.targets,
      )

      const authSession: ThirdPartyAuthSession = {
        anchor: (await fetchProfile()).anchor,
        signedDelegation: publicDelegation,
        userPublicKey: new Uint8Array(publicDelegation.publicKey),
        scope: authRequest.derivationOrigin ?? authRequest.hostname,
      }

      handleSelectAccount({
        status: RequestStatus.SUCCESS,
        authSession,
      })
    } catch (e: any) {
      console.error(e)
      toast.error(e.message)
      handleSelectAccount({
        status: RequestStatus.ERROR,
        errorMessage: e.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    authRequest.derivationOrigin,
    authRequest.hostname,
    authRequest.sessionPublicKey,
    authRequest.targets,
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
        <PublicProfileButton
          isAvailable={!!authRequest.targets}
          onClick={handleSelectPublic}
        />
        {legacyAnonymousProfiles?.map((acc) => (
          <div
            id="profileID"
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
            id="profileID"
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
        {!legacyAnonymousProfiles && isDerivationBug ? (
          <div
            id="hostnameAnonymous"
            className={clsx(
              "border border-gray-300 hover:border-blue-600 hover:bg-blue-50",
              "px-2.5 h-[70px] space-x-2.5 transition-all rounded-md cursor-pointer",
              "flex items-center hover:shadow-[0px_0px_2px_0px_#0E62FF] text-sm",
            )}
            onClick={() => handleSelectAnonymous(true)}
          >
            <IconCmpAnonymous className="w-10 h-10" />
            <span>Anonymous {appMeta.name} profile 2</span>
          </div>
        ) : null}
      </div>
      <div className="flex-1" />
      {/* Hide for this release */}
      {/* <Button type="ghost" block>
        Use a different NFID
      </Button> */}
    </>
  )
}
