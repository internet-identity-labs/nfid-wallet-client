import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import { ModalComponent } from "@nfid-frontend/ui"
import { useState, useCallback } from "react"

import { BlurredLoader, Button, IconCmpPlus } from "@nfid-frontend/ui"

import { passkeyConnector } from "frontend/features/authentication/auth-selection/passkey-flow/services"
import { useDarkTheme } from "frontend/hooks"
import { ERROR_DEVICE_IN_EXCLUDED_CREDENTIAL_LIST } from "frontend/integration/identity"

import { IHandleWithLoading } from ".."
import MultiPasskeyDark from "./multi-passkey-dark.png"
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
  const isDarkTheme = useDarkTheme()

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
                : e.message.includes("either timed out or was not allowed")
                  ? "It seems like the process was interrupted. Feel free to try again!"
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
      <Button
        isSmall
        onClick={handleOpenModal}
        disabled={isDisabled}
        icon={<IconCmpPlus className="w-[18px] h-[18px]" />}
        type="ghost"
        className="text-sm font-bold mt-[20px]"
      >
        Add Passkey
      </Button>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl flex flex-col !h-[600px] !min-h-[600px] relative"
      >
        <BlurredLoader
          isLoading={isLoading}
          overlayClassnames="rounded-[24px]"
        />
        <p className="text-2xl font-bold">Create a Passkey</p>
        <img
          src={isDarkTheme ? MultiPasskeyDark : MultiPasskey}
          alt="Passkey"
          className="w-full my-auto"
        />
        <div>
          <p className={clsx("text-sm leading-5", "text-center !mb-[20px]")}>
            Passkeys let you securely sign in to your NFID using your
            fingerprint, face, screen lock, or hardware security key.
          </p>
          <Button type="primary" block onClick={handleCreatePasskey}>
            Continue
          </Button>
        </div>
      </ModalComponent>
    </div>
  )
}
