import { BlurredLoader, Input, Loader, ModalComponent } from "@nfid-frontend/ui"

import { Button } from "@nfid-frontend/ui"
import { DeletionMode, Plan } from "@nfid/integration"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { validateEmailCode, validateSeedPhrase } from "../utils"

export interface RemoveAccountModalProps {
  isModalVisible: boolean
  setIsModalVisible: (value: boolean) => void
  steps?: Plan
  executeStep: (value: string) => Promise<unknown>
  isLoading: boolean
}

export const RemoveAccountModal = ({
  isModalVisible,
  setIsModalVisible,
  steps,
  executeStep,
  isLoading,
}: RemoveAccountModalProps) => {
  const [currentStep, setCurrentStep] = useState<DeletionMode>()
  const [value, setValue] = useState("")
  const [isValueValid, setIsValueValid] = useState(true)

  const handleClose = () => {
    setIsModalVisible(false)
    setValue("")
    setIsValueValid(true)
  }

  useEffect(() => {
    if (!steps) return

    setCurrentStep(steps.steps[0])
  }, [steps?.steps])

  if (steps?.isCompleted) return null

  return (
    <>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={handleClose}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl relative overflow-hidden"
      >
        <div>
          <BlurredLoader className="" isLoading={isLoading} />
          <p className="text-2xl font-bold">Remove account</p>
          <p className="my-5 text-sm leading-5">
            This will permanently remove your account, wallet, assets, recovery
            information, and all associated data. Once deleted, neither you nor
            our support team will be able to restore access or recover any
            contents.
          </p>
          {currentStep === DeletionMode.RECOVERY_PHRASE && (
            <>
              <p className="text-sm leading-5">
                Enter your recovery phrase to confirm removal:
              </p>
              <textarea
                name="recoveryPhrase"
                className={clsx(
                  "dark:bg-darkGray border border-black dark:border-white rounded-[12px]",
                  "focus:outline-none resize-none focus:ring-0",
                  "w-full leading-[26px] h-[182px] mt-1.5 block",
                  !isValueValid && "!border-red-500",
                )}
                rows={6}
                placeholder="10000 abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art"
                onChange={(e) => {
                  const value = e.target.value
                  setValue(value)
                  if (value) {
                    setIsValueValid(validateSeedPhrase(value))
                  } else {
                    setIsValueValid(true)
                  }
                }}
              />
            </>
          )}
          {currentStep === DeletionMode.EMAIL && (
            <>
              <p className="text-sm leading-5">
                Enter the verification code sent to your email address to
                confirm account removal:
              </p>
              <Input
                onChange={(e) => {
                  const value = e.target.value
                  setValue(value)
                  if (value) {
                    setIsValueValid(validateEmailCode(value))
                  } else {
                    setIsValueValid(true)
                  }
                }}
                className="mt-1.5"
                inputClassName={clsx(
                  !isValueValid && "!border-red-600 focus:!ring-red-600/40",
                )}
              />
            </>
          )}
          <div className="flex gap-2.5 mt-5">
            <Button className="w-full" type="stroke" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="w-full"
              disabled={!value || !isValueValid}
              type="red"
              onClick={() => executeStep(value)}
            >
              Remove account
            </Button>
          </div>
        </div>
      </ModalComponent>
    </>
  )
}
