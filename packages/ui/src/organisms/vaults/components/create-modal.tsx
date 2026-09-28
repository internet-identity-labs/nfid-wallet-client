import { FC, useEffect, useState } from "react"
import clsx from "clsx"
import { ModalComponent } from "@nfid-frontend/ui"
import { Button, Input } from "@nfid-frontend/ui"

import { ReactComponent as ArrowLeft } from "../../../atoms/icons/arrow.svg"
import { Spinner } from "packages/ui/src/atoms/spinner"
import { useForm } from "react-hook-form"
import {
  CreateVaultFormValues,
  CreateVaultModalProps,
  CreateVaultStep,
} from "../types"

import CreateVaultImage from "../assets/create-vault.png"
import toaster from "packages/ui/src/atoms/toast"

export const CreateVaultModal: FC<CreateVaultModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  price,
  priceLoading,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<CreateVaultStep>(CreateVaultStep.PREPARE)

  const {
    register,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<CreateVaultFormValues>({
    mode: "all",
    defaultValues: {
      vaultName: "",
    },
  })

  const vaultName = watch("vaultName")

  useEffect(() => {
    if (!isOpen) {
      reset()
      setStep(CreateVaultStep.PREPARE)
    }
  }, [isOpen, reset])

  const onPay = () => {
    setIsLoading(true)
    onSubmit(vaultName)
      .then(() => {
        toaster.success("Vault has been created successfully")
      })
      .catch((e) => {
        console.error("Vault creation error ", e)
        toaster.error("Something went wrong. Please try again later")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <ModalComponent
      isVisible={isOpen}
      onClose={onClose}
      className={clsx(
        "p-5 w-[95%] md:w-[540px] z-[100] !rounded-[24px] !max-h-[90vh] !min-h-1 overflow-auto",
        "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300 snap-end font-inter",
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-darkGray",
      )}
    >
      <p className="text-[20px] leading-[26px] font-bold dark:text-white mb-5 flex items-center gap-2.5">
        Create a new NFID Vault
        <span className="ml-auto text-gray-300 dark:text-zinc-400 leading-[28px] tracking-[5px] text-sm">
          {Object.values(CreateVaultStep).indexOf(step) + 1}/2
        </span>
      </p>
      <p className="text-gray-800 dark:text-zinc-200 text-sm leading-[22px] mb-5">
        {step === CreateVaultStep.PREPARE
          ? "NFID Vaults are the most secure digital safe deposit boxes for storing your crypto assets. Name it something that you will recognize."
          : "Vaults require both initial and ongoing payments in ICP for operation on the ICP network."}
      </p>
      {step === CreateVaultStep.PREPARE ? (
        <>
          <img src={CreateVaultImage} alt="NFID Vaults" className="w-full" />
          <Input
            inputClassName="h-10 !border-black dark:!border-white"
            id="vault-name"
            labelText="NFID Vault name"
            placeholder="Enter vault name"
            {...register("vaultName", {
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            })}
            errorText={errors.vaultName?.message}
          />
        </>
      ) : (
        <div className="rounded-[12px] bg-portfolioColor dark:bg-zinc-800 p-[30px]">
          <div className="leading-6 font-bold tracking-[0.3px]">
            Pay with ICP
          </div>
          <div className="my-5 text-sm leading-5 text-gray-800 dark:text-zinc-200">
            <p className="mb-[14px]">
              The most decentralized and self-sovereign method of owning digital
              assets.
            </p>
            <ul className="!ml-[22px] !list-disc">
              <li className="mb-2.5">
                Totally decentralized and self-sovereign. Your NFID Vault is
                your own smart contract canister
              </li>
              <li className="mb-2.5">
                Self-sovereign version upgrades (choose your version)
              </li>
              <li className="mb-2.5">
                You are in control of topping-up with gas/cycles
              </li>
              <li>Flexible Discord community support</li>
            </ul>
          </div>
          <div>
            <p className="text-[28px] leading-[38px] tracking-[0.3px]">
              {priceLoading ? (
                <Spinner className="w-5 h-5 mb-4.5" />
              ) : (
                price?.icpPrice
              )}
            </p>
            <p className="text-sm leading-[22px] tracking-[0.3px] text-gray-500 dark:text-zinc-400">
              {priceLoading ? "Loading price…" : price?.cyclePrice}
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2.5 h-10">
        <Button
          type="stroke"
          isSmall
          className="w-full sm:w-[130px] h-full"
          onClick={
            step === CreateVaultStep.PREPARE
              ? onClose
              : () => setStep(CreateVaultStep.PREPARE)
          }
        >
          {step === CreateVaultStep.PREPARE ? "Cancel" : "Back"}
        </Button>
        {step === CreateVaultStep.PREPARE ? (
          <Button
            id={"prepare-vault"}
            isSmall
            className="w-full sm:w-[130px] h-full"
            onClick={() => setStep(CreateVaultStep.PAY)}
            disabled={!isValid}
            iconEnd={<ArrowLeft className="rotate-[180deg]" />}
          >
            Continue
          </Button>
        ) : (
          <Button
            id={"pay-vault"}
            isSmall
            className="w-full sm:w-[130px] h-full"
            onClick={onPay}
            disabled={isLoading || priceLoading}
            iconEnd={isLoading ? <Spinner /> : null}
          >
            Pay
          </Button>
        )}
      </div>
    </ModalComponent>
  )
}
