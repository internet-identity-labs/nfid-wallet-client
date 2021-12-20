import React from "react"
import {
  AuthIframe,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"

import { Button, Loader } from "@identity-labs/ui"
import clsx from "clsx"
import { Modal } from "./modal"
import { ModalHeader } from "./modal/header"

interface InternetAuthProps {}

export const IIAuth: React.FC<InternetAuthProps> = () => {
  const [isLoading, loading] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)
  const { isAuthenticated, identityProvider, authenticate } =
    useInternetIdentity()

  const handleAuthenticate = React.useCallback(async () => {
    await authenticate()
  }, [authenticate])

  return (
    <Button onClick={handleAuthenticate} filled>
      Login with II
    </Button>
  )
}
