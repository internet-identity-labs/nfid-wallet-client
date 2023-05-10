import React from "react"
import { toast } from "react-toastify"

import { ErrorModal } from "@nfid-frontend/ui"
import { VerificationMessage } from "@nfid/service-worker"

import { useServiceWorker as useServiceWorkerDefault } from "./service-worker-dialog.hooks"
import type { UseServiceWorker } from "./service-worker-dialog.hooks"

type ServiceWorkerDialogProps = {
  useServiceWorker?: UseServiceWorker
}

export const ServiceWorkerDialog: React.FC<ServiceWorkerDialogProps> = ({
  useServiceWorker = useServiceWorkerDefault,
}) => {
  const [errorMessages, setErrorMessages] = React.useState<
    VerificationMessage[]
  >([])

  const hasError = errorMessages.length > 0

  const handleMessage = React.useCallback((message: any) => {
    if (message.type === "error") {
      setErrorMessages((messages) => [...messages, message])
    }
  }, [])

  const { state } = useServiceWorker({ onMessage: handleMessage })

  React.useEffect(() => {
    console.debug("ServiceWorkerDialog", { state })
    if (state && ["activated" || "active"].includes(state)) {
      toast.success(`NFID response verification ${state}`)
    }
  }, [state])

  console.debug("ServiceWorkerDialog", { state, hasError })

  return <ErrorModal errorMessages={errorMessages} />
}
