import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useCallback, useState } from "react"
import { toast } from "react-toastify"
import User from "src/assets/userpics/userpic_6.svg"
import useSWR from "swr"

import {
  BlurredLoader,
  Button,
  IconCmpAnonymous,
  IconCmpInfo,
  Tooltip,
  Image,
} from "@nfid-frontend/ui"
import {
  Account,
  ThirdPartyAuthSession,
  authState,
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
import { getPublicProfile } from "./services"

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

  const { data: legacyAnonymousProfiles, isLoading: isAnonymousLoading } =
    useSWR([authRequest, "legacyAnonymousProfiles"], ([authRequest]) =>
      fetchAccountsService({ authRequest }),
    )

  const { data: publicProfile } = useSWR("publicProfile", getPublicProfile)

  const handleSelectLegacyAnonymous = useCallback(
    async (account: Account) => {
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
    setIsLoading(true)
    try {
      const delegation = authState.get().delegationIdentity
      if (!delegation) throw new Error("No delegation identity")

      const anonymousDelegation = await getAnonymousDelegate(
        authRequest.sessionPublicKey,
        delegation,
      )

      const authSession: ThirdPartyAuthSession = {
        anchor: (await fetchProfile()).anchor,
        signedDelegation: anonymousDelegation,
        userPublicKey: authRequest.sessionPublicKey,
        scope: "nfid.one",
      }

      handleSelectAccount(authSession)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [authRequest.sessionPublicKey, handleSelectAccount])

  if (isLoading || isAnonymousLoading || !publicProfile)
    return <BlurredLoader isLoading />

  return (
    <>
      <AuthAppMeta
        applicationLogo={appMeta?.logo}
        applicationURL={appMeta?.url}
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
                <span className="text-blue">
                  {new URL(appMeta.url ?? "").host}
                </span>{" "}
                does not support signing in with a public profile. <br />
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
        <div
          className={clsx(
            "border border-gray-100 bg-gray-50",
            "px-2.5 h-[70px] space-x-2.5 rounded-md",
            "flex items-center w-full",
          )}
        >
          <Image src={User} className="w-10 h-10 shrink-0" />
          <div className="flex items-center justify-between w-full text-sm text-gray-400">
            <div className="">{publicProfile.label}</div>
            <div className="flex flex-col">
              <div className="text-right">{publicProfile.balance} ICP</div>
              <div className="text-xs text-right">
                {publicProfile.balanceUSD}
              </div>
            </div>
          </div>
        </div>
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
            <span>Anonymous {acc.label}</span>
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
      <Button type="ghost" block>
        Use a different NFID
      </Button>
    </>
  )
}
