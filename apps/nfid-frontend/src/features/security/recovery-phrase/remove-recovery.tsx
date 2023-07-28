import clsx from "clsx"
import React, { useState } from "react"

import { IconCmpTrash } from "@nfid-frontend/ui"
import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"
import { securityTracking } from "@nfid/integration"

import { Button } from "frontend/ui/atoms/button"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { IHandleWithLoading } from ".."
import { securityConnector } from "../device-connector"

interface IDeleteRecoveryPhraseModal
  extends React.HTMLAttributes<HTMLDivElement> {
  handleWithLoading: IHandleWithLoading
}

export const DeleteRecoveryPhrase: React.FC<IDeleteRecoveryPhraseModal> = ({
  handleWithLoading,
}) => {
  const [phrase, setPhrase] = useState("")
  const [isModalVisible, setIsModalVisible] = React.useState(false)

  return (
    <div>
      <IconCmpTrash
        onClick={() => setIsModalVisible(true)}
        className="w-6 text-gray-400 cursor-pointer hover:opacity-50"
      />
      <ModalComponent
        isVisible={isModalVisible}
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
            "w-full -mb-2 font-mono leading-[26px] mt-4",
          )}
          rows={6}
          placeholder="10000 cute good fence purity play despair worth year layer install drastic vote skirt noble sadness miss gadget kitten ladder traffic risk phone bamboo "
          onChange={(e) => setPhrase(e.target.value)}
        />
        <Button
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
        </Button>
      </ModalComponent>
    </div>
  )
}
