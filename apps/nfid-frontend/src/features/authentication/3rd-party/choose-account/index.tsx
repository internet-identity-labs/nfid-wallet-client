import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  Account,
  ThirdPartyAuthSession,
  authState,
  getAnonymousDelegate,
  getPublicAccountDelegate,
} from "@nfid/integration"
import { useSWR } from "@nfid/swr"
import {
  BlurredLoader,
  Button,
  IconCmpInfo,
  RadioButton,
  Tooltip,
} from "@nfid/ui"
import toaster from "@nfid/ui/atoms/toast"
import { AuthAppMeta } from "@nfid/ui/organisms/authentication/app-meta"

import { RequestStatus } from "frontend/features/types"
import { fetchProfile } from "frontend/integration/identity-manager"
import { useProfile } from "frontend/integration/identity-manager/queries"
import { fetchAccountsService } from "frontend/integration/identity-manager/services"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { getLegacyThirdPartyAuthSession } from "../../services"
import { PublicProfileButton } from "../public-profile-button"

import { ApproveIcGetDelegationSdkResponse } from "./types"

export interface IAuthChooseAccount {
  onReset: () => void
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

const HOT_FIX_V24_2_WRONG_ANCHORS = 100009230
export type ProfileTypes =
  | ""
  | "public"
  | "legacy-anonymous"
  | "anonymous-1"
  | "anonymous-2"

export const AuthChooseAccount = ({
  onReset,
  appMeta,
  authRequest,
  handleSelectAccount,
}: IAuthChooseAccount) => {
  const [selectedProfile, setSelectedProfile] = useState<ProfileTypes>("")
  const [selectedLegacyAccount, setSelectedLegacyAccount] = useState<any>()
  const [isLoading, setIsLoading] = useState(false)
  console.debug("AuthChooseAccount", { appMeta })
  const { profile } = useProfile()

  const { data: legacyAnonymousProfiles, isLoading: isAnonymousLoading } =
    useSWR(
      [authRequest, "legacyAnonymousProfiles"],
      ([authRequest]) => fetchAccountsService({ authRequest }),
      {
        onError: async () => {
          await authState.reset(false)
          onReset()
        },
      },
    )

  console.debug("AuthChooseAccount", {
    legacyAnonymousProfiles,
    selectedLegacyAccount,
    selectedProfile,
  })

  const isDerivationBug = useMemo(() => {
    if (!profile?.anchor) return false

    const isDerivationBug = HOT_FIX_V24_1_WRONG_HOSTNAMES.includes(
      authRequest.hostname,
    )

    console.debug("isDerivationBug", { isDerivationBug, authRequest })

    return isDerivationBug && profile?.anchor < HOT_FIX_V24_2_WRONG_ANCHORS
  }, [authRequest, profile?.anchor])

  const handleSelectLegacyAnonymous = useCallback(
    async (account: Account) => {
      console.debug("handleSelectLegacyAnonymous", { account })
      setIsLoading(true)
      try {
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
        toaster.error(e.message)
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
      setIsLoading(true)
      try {
        const delegation = authState.get().delegationIdentity
        if (!delegation) throw new Error("No delegation identity")

        const domain = useHostName
          ? authRequest.hostname
          : (authRequest.derivationOrigin ?? authRequest.hostname)

        const anonymousDelegation = await getAnonymousDelegate(
          authRequest.sessionPublicKey,
          delegation,
          domain,
          authRequest.maxTimeToLive
            ? Number(authRequest.maxTimeToLive / BigInt(1000000))
            : undefined,
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
        toaster.error(e.message)
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
      authRequest.maxTimeToLive,
      authRequest.sessionPublicKey,
      handleSelectAccount,
    ],
  )

  const handleSelectPublic = useCallback(async () => {
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
        authRequest.maxTimeToLive
          ? Number(authRequest.maxTimeToLive / BigInt(1000000))
          : undefined,
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
      toaster.error(e.message)
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
    authRequest.maxTimeToLive,
    authRequest.sessionPublicKey,
    authRequest.targets,
    handleSelectAccount,
  ])

  const onSubmit = useCallback(() => {
    if (selectedProfile === "anonymous-1") return handleSelectAnonymous()
    if (selectedProfile === "anonymous-2") return handleSelectAnonymous(true)
    if (selectedProfile.includes("legacy-anonymous"))
      return handleSelectLegacyAnonymous(selectedLegacyAccount)
    if (selectedProfile === "public") return handleSelectPublic()

    return toaster.error("Something went wrong. Please select a profile.")
  }, [
    handleSelectAnonymous,
    handleSelectLegacyAnonymous,
    handleSelectPublic,
    selectedLegacyAccount,
    selectedProfile,
  ])

  const onBack = useCallback(async () => {
    await authState.logout(false)
    onReset()
  }, [onReset])

  useEffect(() => {
    if (isAnonymousLoading) return
    if (!!authRequest.targets?.length) return setSelectedProfile("public")
    if (!!legacyAnonymousProfiles?.length) {
      setSelectedProfile("legacy-anonymous")
      setSelectedLegacyAccount(legacyAnonymousProfiles[0])
      return
    }
    setSelectedProfile("anonymous-1")
  }, [authRequest.targets?.length, isAnonymousLoading, legacyAnonymousProfiles])

  if (isLoading || isAnonymousLoading) return <BlurredLoader isLoading />

  let appHost: string = ""
  try {
    appHost = new URL(authRequest.hostname ?? "").host
  } catch (_e) {
    appHost = appMeta.name ?? ""
  }

  return (
    <>
      <AuthAppMeta applicationURL={appHost} subTitle="Wallet permissions for" />
      {!authRequest.targets && (
        <div className="absolute right-5 top-2.5">
          <TooltipProvider>
            <Tooltip
              className="w-[368px]"
              tip={
                <div>
                  <a className="text-blue" href={`https://${appHost}`}>
                    {appHost}
                  </a>{" "}
                  does not support connecting your NFID Wallet address for
                  payment requests.
                </div>
              }
            >
              <IconCmpInfo className="text-black" />
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div className="relative flex flex-col flex-1 w-full">
        <div
          className={clsx(
            "w-full pt-4 rounded-xl",
            "flex flex-col flex-1 font-inter bg-white",
            "border border-gray-200",
            "shadow-[0px_4px_10px_0px_rgba(0,0,0,0.02)]",
            "mt-9",
          )}
        >
          <div className="px-5">
            <p className="text-sm font-bold">Share NFID Wallet address</p>
            <p className="mt-2 text-xs text-gray-500">
              Allow this site to request payments and view your balances.
            </p>
            <PublicProfileButton
              selectedProfile={selectedProfile}
              setSelectedProfile={(value) => setSelectedProfile(value)}
              isAvailable={!!authRequest.targets?.length}
              onError={async () => {
                await authState.reset(false)
                onReset()
              }}
            />
          </div>
          <div className="bg-gray-200 w-full h-[1px] my-[14px]" />
          <div className="flex-1 px-5">
            <p className="text-sm font-bold">Hide NFID Wallet address</p>
            <p className="mt-2 text-xs text-gray-500">
              Connect anonymously to prevent this site from requesting payments
              and viewing your balances.
            </p>

            {/* Legacy anonymous profiles */}
            {legacyAnonymousProfiles?.map((acc) => (
              <div
                className="flex items-center h-5 mt-5 text-xs"
                key={`legacy_persona_${acc.accountId}`}
              >
                <RadioButton
                  id={`profile_legacy_${acc.accountId}`}
                  value={`legacy-anonymous-${acc.accountId}`}
                  checked={acc.accountId === selectedLegacyAccount?.accountId}
                  name={`profile-${acc.accountId}`}
                  onChange={(e) => {
                    setSelectedLegacyAccount(acc)
                    setSelectedProfile(e.target.value as ProfileTypes)
                  }}
                  text={`${appMeta.name} account ${
                    parseInt(acc.accountId) + 1
                  }`}
                />
              </div>
            ))}

            {/* Anonymous profile */}
            {!legacyAnonymousProfiles?.length ? (
              <div className="flex items-center h-5 mt-5 text-xs">
                <RadioButton
                  id="profile_anonymous-1"
                  value="anonymous-1"
                  checked={selectedProfile === "anonymous-1"}
                  name={"profile"}
                  onChange={(e) =>
                    setSelectedProfile(e.target.value as ProfileTypes)
                  }
                />
                <label
                  htmlFor="profile_anonymous-1"
                  className="ml-2 cursor-pointer"
                >
                  Anonymous {appMeta.name} profile {isDerivationBug ? "1" : ""}
                </label>
              </div>
            ) : null}

            {/* Anonymous profile with derivation bug */}
            {!legacyAnonymousProfiles?.length && isDerivationBug ? (
              <div className="flex items-center h-5 mt-4 text-xs">
                <RadioButton
                  id="anonymous-2"
                  value="anonymous-2"
                  checked={selectedProfile === "anonymous-2"}
                  name={"profile"}
                  onChange={(e) =>
                    setSelectedProfile(e.target.value as ProfileTypes)
                  }
                />
                <label
                  htmlFor="profile_anonymous-2"
                  className="ml-2 cursor-pointer"
                >
                  Anonymous {appMeta.name} profile 2
                </label>
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <Button onClick={onBack} type="stroke">
            Back
          </Button>
          <Button
            id="connect"
            onClick={() => {
              onSubmit()
            }}
            type="primary"
          >
            Connect
          </Button>
        </div>
      </div>
    </>
  )
}
