import { Button, H1 } from "@nfid-frontend/ui"
import { requestAccounts } from "@nfid/accounts"
import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"

import { environment } from "../../environments/environment"
import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

const APPLICATION_LOGO_URL = "https%3A%2F%2Flogo.clearbit.com%2Fclearbit.com"

export const PageGetAccounts = () => {
  const [requestButton, updateRequestButton] = useButtonState({
    label: "Request accounts",
  })

  const [principal, setPrincipal] = useState("")

  const handleRequestAccounts = useCallback(async () => {
    updateRequestButton({ loading: true, disabled: true })
    const result = await requestAccounts({
      provider: new URL(
        `${environment.nfidProviderOrigin}/wallet/request-accounts?applicationName=RequestTransfer&applicationLogo=${APPLICATION_LOGO_URL}`,
      ),
    })
    updateRequestButton({ loading: false, disabled: false })
    console.log({ result })
  }, [updateRequestButton])

  return (
    <PageTemplate title="Get accounts">
      <H1 className="title">Request accounts</H1>

      <div className="flex flex-col w-64">
        <Button
          primary
          disabled={requestButton.disabled}
          onClick={handleRequestAccounts}
        >
          {requestButton.loading ? (
            <div className={clsx("flex items-center space-x-2")}>
              <ImSpinner className={clsx("animate-spin")} />
              <div>{requestButton.label}</div>
            </div>
          ) : (
            requestButton.label
          )}
        </Button>
      </div>

      <div
        className={clsx(
          "w-full border border-gray-200 rounded-xl",
          "px-5 py-4 mt-8",
          "sm:px-[30px] sm:py-[26px]",
        )}
      >
        <h2 className={clsx("font-bold")}>Identity principal:</h2>
        <pre>{JSON.stringify(principal, null, 2)}</pre>
      </div>
    </PageTemplate>
  )
}
