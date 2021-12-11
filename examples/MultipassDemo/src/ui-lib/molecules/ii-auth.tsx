import React from "react"
import {
  AuthIframe,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"

import { Modal } from "src/ui-lib/molecules/modal"
import { ModalHeader } from "./modal/header"
import { Button, Chip, Loader } from "@identitylabs/ui"

import clsx from "clsx"

interface InternetAuthProps {}

export const IIAuth: React.FC<InternetAuthProps> = () => {
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

  const handleClose = React.useCallback(() => {
    setShowModal(false)
  }, [])

  React.useEffect(() => {
    isAuthenticated && setShowModal(false)
  }, [isAuthenticated])

  return showModal ? (
    <Modal
      id="ii-auth"
      isVisible={showModal}
      onClose={handleClose}
      className={clsx("w-1/2 h-1/2")}
    >
      <ModalHeader onClose={handleClose} />
      <div className={clsx("py-10 w-full h-full")}>
        <Loader isLoading={isLoading} />
        <AuthIframe src={identityProvider} onLoad={handleAuthentication} />
      </div>
    </Modal>
  ) : (
    <>
      <Chip dense>chip</Chip>
      <Button onClick={() => setShowModal(true)} filled>
        Login with II
      </Button>
    </>
  )
}
