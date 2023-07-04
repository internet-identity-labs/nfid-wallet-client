import { TooltipProvider } from "@radix-ui/react-tooltip"
import clsx from "clsx"
import { useCallback, useMemo, useState } from "react"
import useSWR from "swr"

import {
  BlurredLoader,
  Button,
  IconCmpAnonymous,
  IconCmpInfo,
  Tooltip,
} from "@nfid-frontend/ui"
import { Account, ThirdPartyAuthSession } from "@nfid/integration"

import { fetchAccountsService } from "frontend/integration/identity-manager/services"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { getThirdPartyAuthSession } from "../../services"
import { AuthAppMeta } from "../../ui/app-meta"

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

  const publicProfile = useMemo(async () => {}, [])

  const handleSelectAnonymous = useCallback(
    async (account: Account) => {
      setIsLoading(true)
      const authSession = await getThirdPartyAuthSession(
        authRequest,
        account.accountId,
      )

      handleSelectAccount(authSession)
    },
    [authRequest, handleSelectAccount],
  )

  const { data: legacyAnonymousProfiles } = useSWR(
    [authRequest, "legacyAnonymousProfiles"],
    ([authRequest]) => fetchAccountsService({ authRequest }),
  )

  if (isLoading) return <BlurredLoader isLoading />

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
            <IconCmpInfo />
          </Tooltip>
        </TooltipProvider>
      </div>
      {/* <ChooseItem
        // {...rootAccount}
        // handleClick={() => handleSelectAccount()}
      />
      <hr />
      {appSpecificAccounts.map((account) => (
        <ChooseItem
          {...account}
          key={account.value}
          handleClick={() => handleSelectAccount(account)}
        />
      ))} */}
      <div className="w-full space-y-2.5 my-9">
        {legacyAnonymousProfiles?.map((acc) => (
          <div
            key={acc.label}
            className={clsx(
              "border border-gray-300 hover:border-blue-600 hover:bg-blue-50",
              "px-2.5 h-[70px] space-x-2.5 transition-all rounded-md cursor-pointer",
              "flex items-center hover:shadow-[0px_0px_2px_0px_#0E62FF]",
            )}
            onClick={() => handleSelectAnonymous(acc)}
          >
            <IconCmpAnonymous className="w-10 h-10" />
            <span>Anonymous {acc.label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <Button type="ghost" block>
        Use a different NFID
      </Button>
    </>
  )
}
