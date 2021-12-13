import React from "react"
import {
  AuthIframe,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"

import { Modal } from "src/ui-lib/molecules/modal"
import { ModalHeader } from "./modal/header"
import { Button, Chip, IFrame, Loader } from "@identitylabs/ui"
import clsx from "clsx"

interface InternetAuthProps {}

export const IIAuth: React.FC<InternetAuthProps> = () => {
  const [isLoading, loading] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)
  const { isAuthenticated, identityProvider, authenticate } =
    useInternetIdentity()
    
  function iframeDynamicDimensions(frame: any) {
    const dimensions = {
      width: 200,
      height: 200,
      topBarHeight: 57,
    }

    if (frame) {
      let iframeHeight = frame.contentWindow.document.body.scrollHeight
      let iframeWidth = frame.contentWindow.document.body.scrollWidth

      dimensions.height = dimensions.topBarHeight + iframeHeight

      setInterval(() => {
        if (
          iframeHeight !== dimensions.height ||
          iframeWidth !== dimensions.width
        ) {
          iframeHeight = frame.contentWindow.document.body.scrollHeight
          iframeWidth = frame.contentWindow.document.body.scrollWidth

          dimensions.width = iframeWidth
          dimensions.height = dimensions.topBarHeight + iframeHeight
        }
      }, 200)

      return dimensions
    }
  }

  const handleAuthentication: any = React.useCallback(
    async (frame: any) => {
      loading(false)

      const dimensions = iframeDynamicDimensions(frame)
      console.log("dimensions :>> ", dimensions)

      try {
        await authenticate()
      } catch {
        console.error("something happened")
      }
    },
    [authenticate],
  )

  const handleClose = React.useCallback(() => {
    setShowModal(false)
  }, [])

  React.useEffect(() => {
    isAuthenticated && setShowModal(false)
  }, [isAuthenticated])

  return showModal ? (
    <Modal id="ii-auth" isVisible={showModal} onClose={handleClose}>
      <ModalHeader onClose={handleClose} />
      <div className={clsx("py-10 w-full h-full")}>
        <Loader isLoading={isLoading} />
        <AuthIframe
          src={identityProvider}
          onLoad={(frame) => handleAuthentication(frame.target)}
          id="idpWindow"
        />
      </div>
    </Modal>
  ) : (
    <Button onClick={() => setShowModal(true)} filled>
      Login with II
    </Button>
  )
}
