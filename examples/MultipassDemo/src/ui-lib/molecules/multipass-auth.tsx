import React from "react"
import {
  AuthIframe,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"
import { Modal } from "src/ui-lib/molecules/modal"

import { ModalHeader } from "./modal/header"
import clsx from "clsx"
import { Loader } from "../atoms/loader"
import { IFrame } from "@identity-labs/ui"

interface InternetAuthProps {}

export const MultipassAuth: React.FC<InternetAuthProps> = () => {
  const [isLoading, loading] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)
  const { isAuthenticated, identityProvider, authenticate } =
    useInternetIdentity()

  const handleAuthentication = React.useCallback(async () => {
    loading(false)
    try {
      await authenticate()
    } catch {
      console.error("something happened")
    }
  }, [authenticate])

  React.useEffect(() => {
    const timeout = setTimeout(() => setShowModal(true), 500)
    return () => clearTimeout(timeout)
  }, [])

  React.useEffect(() => {
    isAuthenticated && setShowModal(false)
  }, [isAuthenticated])

  return showModal ? (
    // Uses our default IFrame component with built in components
    <IFrame src={identityProvider} onLoad={handleAuthentication} />
  ) : null
}
