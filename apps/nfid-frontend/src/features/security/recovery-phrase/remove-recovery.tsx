import clsx from "clsx"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import React, { useState } from "react"

import { Button, IconCmpTrash } from "@nfid-frontend/ui"
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
        <p className="text-2xl font-bold leading-[40px]">
          Remove recovery phrase
        </p>
        <p className="mt-5 text-sm leading-[22px]">
          Enter your recovery phrase to confirm removal:
        </p>

        <textarea
          name="recoveryPhrase"
          className={clsx(
            "border border-black rounded-[12px]",
            "focus:outline-none resize-none focus:ring-0",
            "w-full -mb-2 leading-[26px] h-[218px] mb-5",
          )}
          rows={6}
          placeholder="10000 cute good fence purity play despair worth year layer install drastic vote skirt noble sadness miss gadget kitten ladder traffic risk phone bamboo "
          onChange={(e) => setPhrase(e.target.value)}
        />
        <Button
          id="delete-recovery-button"
          type="red"
          block
          onClick={() =>
            handleWithLoading(
              async () => {
                const response = await securityConnector.deleteRecoveryPhrase(
                  phrase,
                )
                return response
              },
              () => setIsModalVisible(false),
            )
          }
          disabled={phrase.split(" ").length < 11}
        >
          Remove recovery phrase
        </Button>
      </ModalComponent>
    </div>
  )
}
