import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { useState, useCallback } from "react"

import { BlurredLoader, Button, IconCmpPlus } from "@nfid-frontend/ui"

import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"

import { IHandleWithLoading } from ".."
import MultiPasskey from "./multi-passkey.webp"

export const AddPasskey = ({
  handleWithLoading,
  isDisabled,
  isLoading,
}: {
  handleWithLoading: IHandleWithLoading
  isDisabled?: boolean
  isLoading: boolean
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleOpenModal = useCallback(() => {
    setIsModalVisible(true)
  }, [])

  const handleCreatePasskey = useCallback(() => {
    handleWithLoading(
      async () => {
        try {
          await passkeyConnector.createCredential()
          toaster.success("Device has been added")
        } catch (e) {
          if (e instanceof Error) {
            toaster.info(
              ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST.includes(e.message)
                ? "This device is already registered."
                : e.message,
            )
          }
          throw e
        }
      },
      () => setIsModalVisible(false),
    )
  }, [handleWithLoading])

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
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl flex flex-col !h-[600px] !min-h-[600px]"
      >
        <BlurredLoader
          isLoading={isLoading}
          overlayClassnames="rounded-[24px]"
        />
        <p className="text-2xl font-bold">Create a Passkey</p>
        <img src={MultiPasskey} alt="Passkey" className="w-full my-auto" />
        <div>
          <p className={clsx("text-sm leading-5", "text-center !mb-[20px]")}>
            Passkeys let you securely sign in to your NFID using your
            fingerprint, face, screen lock, or hardware security key.
          </p>
          <Button type="primary" block onClick={handleCreatePasskey}>
            Continue
          </Button>
          <Button
            type="ghost"
            block
            className="mt-[10px]"
            onClick={() =>
              window.open(
                "https://learn.nfid.one/managing-my-security/managing-my-passkeys",
                "_blank",
              )
            }
          >
            Learn about Passkeys
          </Button>
        </div>
      </ModalComponent>
    </div>
  )
}
