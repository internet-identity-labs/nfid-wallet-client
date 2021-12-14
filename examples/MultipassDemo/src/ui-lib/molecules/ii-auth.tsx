import React from "react"
import {
  AuthIframe,
  useInternetIdentity,
} from "@identity-labs/react-ic-ii-auth"

import { Modal } from "src/ui-lib/molecules/modal"
import { ModalHeader } from "./modal/header"

import clsx from "clsx"
import { Button, IFrame, Loader } from "@identity-labs/ui"

interface InternetAuthProps {}

export const IIAuth: React.FC<InternetAuthProps> = () => {
  const [isLoading, loading] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)
  const { isAuthenticated, identityProvider, authenticate } =
    useInternetIdentity()

  function iframeDynamicDimensions() {
    const frame = document.querySelector("#iframe-wrapper") as HTMLIFrameElement

    const dimensions = {
      width: 200,
      height: 830,
      topBarHeight: 57,
    }

    if (frame) {
      let iframeHeight = frame?.contentWindow?.document.body.scrollHeight || 0
      let iframeWidth = frame?.contentWindow?.document.body.scrollWidth || 0

      dimensions.height = dimensions.topBarHeight + iframeHeight

      setInterval(() => {
        if (
          iframeHeight !== dimensions.height ||
          iframeWidth !== dimensions.width
        ) {
          iframeHeight = frame?.contentWindow?.document.body.scrollHeight || 0
          iframeWidth = frame?.contentWindow?.document.body.scrollWidth || 0

          dimensions.width = iframeWidth
          dimensions.height = dimensions.topBarHeight + iframeHeight
        }
      }, 200)

      return dimensions
    }
  }

  const handleAuthentication: any = React.useCallback(async () => {
    loading(false)

    const dimensions = iframeDynamicDimensions()
    console.log("dimensions :>> ", dimensions)

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
    <Modal id="ii-auth" isVisible={showModal} onClose={handleClose}>
      <ModalHeader onClose={handleClose} />
      <div className={clsx("py-10 w-full h-full")}>
        <Loader isLoading={isLoading} />
        <AuthIframe
          src={identityProvider}
          onLoad={handleAuthentication}
          id="idpWindow"
        />
      </div>
    </Modal>
    // <IFrame
    //   title="Internet Identity"
    //   src={identityProvider}
    //   onLoad={handleAuthentication}
    //   height={iframeDynamicDimensions()?.height}
    // />
  ) : (
    <>
      <Button onClick={() => setShowModal(true)} filled>
        Login with II
      </Button>
    </>
  )
}
