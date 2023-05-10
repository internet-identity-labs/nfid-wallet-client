import React from "react"

import type { VerificationMessage as ServiceWorkerMessages } from "@nfid/service-worker"

import { register } from "../../../packages/service-worker/src/service-worker-registration"

type UseServiceWorkerResult = { state?: ServiceWorkerState }

type MessageHandler = (message: ServiceWorkerMessages) => void

type UseSericeWorkerProps = {
  onMessage: MessageHandler
}
export type UseServiceWorker = (
  props: UseSericeWorkerProps,
) => UseServiceWorkerResult

interface ServiceWorkerStateChangeEvent extends Event {
  target: ServiceWorker
}

const isServiceWorkerStateChange = (
  event: Event,
): event is ServiceWorkerStateChangeEvent => {
  return event.target instanceof ServiceWorker
}

const useServiceWorkerMessages = ({
  onMessage,
}: {
  onMessage: MessageHandler
}) => {
  const handleMessage = React.useCallback(
    (event: MessageEvent) => {
      event.data.type === "error"
        ? console.error("useServiceWorkerMessages", { event })
        : console.debug("useServiceWorkerMessages", { event })
      onMessage(event.data)
    },
    [onMessage],
  )

  React.useEffect(() => {
    navigator.serviceWorker.addEventListener("message", handleMessage)
    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage)
  })
}

const useServiceWorkerRegistration = () => {
  const [state, setState] = React.useState<ServiceWorkerState>()

  const [, setServiceWorker] = React.useState<ServiceWorker | null>()

  const handleStateChange = React.useCallback((event: Event) => {
    if (isServiceWorkerStateChange(event)) {
      console.debug("useServiceWorker:handleStateChange", {
        state: event.target.state,
      })
      setState(event.target.state)
    }
  }, [])

  const handleRegistration = React.useCallback(
    (registration: ServiceWorkerRegistration) => {
      console.debug("useServiceWorker:handleRegistration", { registration })
      const { active, installing, waiting } = registration
      const serviceWorker = active || installing || waiting
      if (serviceWorker) {
        setServiceWorker(serviceWorker)
        serviceWorker.addEventListener("statechange", handleStateChange)
      }
    },
    [handleStateChange],
  )

  React.useEffect(() => {
    register({ onUpdate: handleRegistration })
  }, [handleRegistration])
  return { state }
}

export const useServiceWorker: UseServiceWorker = ({ onMessage }) => {
  const { state } = useServiceWorkerRegistration()
  useServiceWorkerMessages({ onMessage })

  console.debug("useServiceWorker", {
    state,
  })

  return { state }
}
