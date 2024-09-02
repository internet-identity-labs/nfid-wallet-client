import clsx from "clsx"
import { ButtonAlt } from "packages/ui/src/atoms/button"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import React, { useState } from "react"

import { IconCmpTrash } from "@nfid-frontend/ui"
import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"
import { securityTracking } from "@nfid/integration"
import { authState } from "@nfid/integration"

import { IHandleWithLoading } from ".."
import { RemoveDeviceInUseError } from "../components/remove-device-in-use-error"
import { securityConnector } from "../device-connector"
import { IDevice } from "../types"

interface IDeleteRecoveryPhraseModal
  extends React.HTMLAttributes<HTMLDivElement> {
  device: IDevice
  handleWithLoading: IHandleWithLoading
}

export const DeleteRecoveryPhrase: React.FC<IDeleteRecoveryPhraseModal> = ({
  device,
  handleWithLoading,
}) => {
  const [phrase, setPhrase] = useState("")
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const { activeDevicePrincipalId } = authState.get()
  const isInUseDevice = activeDevicePrincipalId === device.principal

  return (
    <div>
      <IconCmpTrash
        onClick={() => setIsModalVisible(true)}
        className="w-6 text-gray-400 cursor-pointer hover:opacity-50"
      />
      <RemoveDeviceInUseError
        isModalVisible={isModalVisible && isInUseDevice}
        setIsModalVisible={setIsModalVisible}
      />
      <ModalComponent
        isVisible={isModalVisible && !isInUseDevice}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl"
      >
        <p className="text-2xl font-bold">Remove recovery phrase</p>
        <p className="mt-5 text-sm">
          Enter your recovery phrase to confirm removal.
        </p>

        <textarea
          name="recoveryPhrase"
          className={clsx(
            SENSITIVE_CONTENT_NO_SESSION_RECORDING,
            "border border-black rounded-t-md border-b-0",
            "focus:outline-none resize-none focus:ring-0",
            "w-full -mb-2 leading-[26px] mt-4",
          )}
          rows={6}
          placeholder="10000 cute good fence purity play despair worth year layer install drastic vote skirt noble sadness miss gadget kitten ladder traffic risk phone bamboo "
          onChange={(e) => setPhrase(e.target.value)}
        />
        <ButtonAlt
          id="delete-recovery-button"
          error
          block
          className="rounded-t-none"
          onClick={() =>
            handleWithLoading(
              async () => {
                const response = await securityConnector.deleteRecoveryPhrase(
                  phrase,
                )
                securityTracking.recoveryPhraseRemoved()
                return response
              },
              () => setIsModalVisible(false),
            )
          }
          disabled={phrase.split(" ").length < 11}
        >
          Remove recovery phrase
        </ButtonAlt>
      </ModalComponent>
    </div>
  )
}
