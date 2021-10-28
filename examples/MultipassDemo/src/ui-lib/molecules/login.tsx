import React from 'react'
import { Button } from 'src/ui-lib/atoms/button'
import { useInternetIdentity } from '@identity-labs/react-ic-ii-auth'
import { Modal } from 'src/ui-lib/molecules/modal'
import { InternetIdentityIframe } from './internet-identity-auth'

import { ModalHeader } from './modal/header'
import { SimulateRemoteDelegate } from './simulate-remote-delegate'

interface InternetAuthProps {
  onClick?: () => void
}

export const InternetAuthButton: React.FC<InternetAuthProps> = ({
  onClick
} = {}) => {
  const [showJsonDelegateModal, setShowJsonDelegateModal] =
    React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const { isAuthenticated, identityProvider, authenticate } =
    useInternetIdentity()

  const handleAuthModal = React.useCallback(() => {
    setShowModal(true)
    onClick && onClick()
  }, [onClick])

  const handleAuthentication = React.useCallback(async () => {
    try {
      await authenticate()
    } catch {
      console.error('something happened')
    }
  }, [authenticate])

  const handleNewAuth = React.useCallback(
    () => setShowJsonDelegateModal(true),
    []
  )

  const handleClose = React.useCallback(() => {
    setShowModal(false)
    setShowJsonDelegateModal(false)
  }, [])

  React.useEffect(() => {
    const timeout = setTimeout(() => setShowModal(true), 500)
    return () => clearTimeout(timeout)
  }, [])

  React.useEffect(() => {
    isAuthenticated && setShowModal(false)
  }, [isAuthenticated])

  return (
    <>
      <Button onClick={handleAuthModal}>Login Modal</Button>
      <Button onClick={handleNewAuth}>Simulate Delegate</Button>
      {showModal && (
        <Modal
          className='md:min-w-[450px]'
          isVisible={showModal}
          onClose={handleClose}
        >
          <ModalHeader onClose={handleClose} />
          <InternetIdentityIframe
            internetIdentityProvider={identityProvider}
            onLoad={handleAuthentication}
          />
        </Modal>
      )}
      {showJsonDelegateModal && (
        <Modal
          className='md:min-w-[450px]'
          isVisible={showModal}
          onClose={handleClose}
        >
          <ModalHeader onClose={handleClose} />
          <SimulateRemoteDelegate />
        </Modal>
      )}
    </>
  )
}
