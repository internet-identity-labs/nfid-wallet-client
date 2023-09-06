import clsx from "clsx"
import { useCallback, useState } from "react"
import { ImSpinner } from "react-icons/im"

import { Button, H1 } from "@nfid-frontend/ui"

import { useButtonState } from "../../hooks/useButtonState"
import { PageTemplate } from "../page-template"

export const PageGetAccounts = () => {
  const [requestButton, updateRequestButton] = useButtonState({
    label: "Request accounts",
  })

  const [nfidResponse] = useState({})

  const handleRequestAccounts = useCallback(async () => {
    updateRequestButton({ loading: true, disabled: true })
    // FIXME: Replace with own new sdk method
    // const result = await nfid.getAccounts()
    // setNfidResponse(result)
    updateRequestButton({ loading: false, disabled: false })
  }, [updateRequestButton])

  return (
    <PageTemplate title="Get accounts">
      <H1 className="title">Request accounts</H1>

      <div className="flex flex-col w-64 my-8">
        <Button
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
        <h2 className={clsx("font-bold mb-1")}>NFID Response:</h2>
        <pre>{JSON.stringify(nfidResponse, null, 2)}</pre>
      </div>
    </PageTemplate>
  )
}
