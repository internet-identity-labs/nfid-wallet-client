import clsx from "clsx"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import React from "react"
import { ToastContainer } from "react-toastify"

import { Button, Checkbox, IconCmpPlus } from "@nfid-frontend/ui"
import { securityTracking } from "@nfid/integration"

import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"

import { IHandleWithLoading } from ".."
import isSafari from "../utils"
import MultiPasskey from "./multi-passkey.webp"
import SinglePasskey from "./single-passkey.webp"

export const AddPasskey = ({
  handleWithLoading,
  isDisabled,
}: {
  handleWithLoading: IHandleWithLoading
  isDisabled?: boolean
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [isMultiDevice, setIsMultiDevice] = React.useState(true)

  const handleOpenModal = React.useCallback(() => {
    setIsModalVisible(true)
    securityTracking.addPasskey()
  }, [])

  const handleCreatePasskey = React.useCallback(() => {
    securityTracking.passkeyCreationInitiated(isSafari() ? true : isMultiDevice)
    handleWithLoading(
      () =>
        passkeyConnector.createCredential({
          isMultiDevice: isSafari() ? true : isMultiDevice,
        }),
      () => setIsModalVisible(false),
    )
  }, [handleWithLoading, isMultiDevice])

  return (
    <div>
      <div
        className={clsx(
          "inline-flex items-center space-x-2.5 pl-2.5 h-[40px] text-primaryButtonColor",
          "hover:opacity-50 cursor-pointer transition-opacity mt-[20px]",
          isDisabled && "pointer-events-none !text-gray-400 cursor-not-allowed",
        )}
        onClick={handleOpenModal}
      >
        <IconCmpPlus className="w-[18px] h-[18px]" />
        <span className="text-sm font-bold">Add Passkey</span>
      </div>

      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl"
      >
        <ToastContainer />
        <div className="space-y-3.5">
          <p className="text-2xl font-bold">Create a Passkey</p>
          <img
            src={isMultiDevice ? MultiPasskey : SinglePasskey}
            alt="Passkey"
            className="w-full"
          />
          <p
            className={clsx(
              "text-sm leading-5",
              isSafari() && "text-center !my-10",
            )}
          >
            Passkeys let you securely sign in to your NFID using your
            fingerprint, face, screen lock, or hardware security key.
          </p>

          {!isSafari() && (
            <>
              <Checkbox
                id="isMultiDevice"
                value={"isMultiDevice"}
                isChecked={isMultiDevice}
                onChange={() => setIsMultiDevice(!isMultiDevice)}
                labelText="Create a multi-device Passkey"
                labelClassName="!text-sm"
              />
              <p className="ml-[26px] text-xs text-gray-400">
                Multi-device Passkeys are highly recommended because they’re
                generally more convenient and easier to secure. Some devices,
                like newer iPhones, only support multi-device Passkeys.
              </p>
            </>
          )}
          <Button type="primary" block onClick={handleCreatePasskey}>
            Continue
          </Button>
        </div>
        <Button
          type="ghost"
          block
          className="mt-1"
          onClick={() =>
            window.open(
              "https://learn.nfid.one/enable-2fa-for-enterprise-grade-security",
              "_blank",
            )
          }
        >
          Learn about Passkeys
        </Button>
      </ModalComponent>
    </div>
  )
}
