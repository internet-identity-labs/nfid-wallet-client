import clsx from "clsx"
import {
  ICRC1Data,
  addICRC1Canister,
  isICRC1Canister,
  ICRC1Error,
} from "packages/integration/src/lib/token/icrc1"
import { UnknownIcon } from "packages/ui/src/atoms/icons/unknown"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { BlurredLoader, Button, Input, Warning } from "@nfid-frontend/ui"
import { DEFAULT_ERROR_TEXT } from "@nfid/integration/token/icrc1/constants"

import { CANISTER_ID_LENGTH } from "frontend/features/transfer-modal/utils/validations"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

export const ProfileAssetsHeader = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<ICRC1Data | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenImportToken = () => {
    setIsModalVisible(true)
  }

  const {
    register,
    formState: { errors },
    handleSubmit,
    resetField,
    getValues,
  } = useForm({
    mode: "all",
    defaultValues: {
      ledgerID: "",
      indexID: "",
    },
  })

  useEffect(() => {
    if (errors.ledgerID) {
      resetField("indexID")
      setTokenInfo(null)
    }
  }, [errors.ledgerID, resetField])

  const submit = async (values: { ledgerID: string; indexID: string }) => {
    const { ledgerID, indexID } = values

    try {
      setIsLoading(true)
      await addICRC1Canister(ledgerID, indexID)
      setIsModalVisible(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchICRCToken = async () => {
    try {
      const { rootPrincipalId, publicKey } = await getLambdaCredentials()
      const data = await isICRC1Canister(
        getValues("ledgerID"),
        rootPrincipalId!,
        publicKey,
        getValues("indexID"),
      )
      setTokenInfo(data)
      return true
    } catch (e) {
      if (e instanceof ICRC1Error) {
        return e.message
      }

      return DEFAULT_ERROR_TEXT
    }
  }

  const validationConfig = {
    minLength: {
      value: CANISTER_ID_LENGTH,
      message: `Canister ID must be ${CANISTER_ID_LENGTH} characters long`,
    },
    maxLength: {
      value: CANISTER_ID_LENGTH,
      message: `Canister ID must be ${CANISTER_ID_LENGTH} characters long`,
    },
    validate: fetchICRCToken,
  }

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <p>Your tokens</p>
        <Button
          className={clsx("px-[10px] md:flex pr-0 md:pr-[15px] z-10")}
          id="importToken"
          onClick={handleOpenImportToken}
          icon={<PlusIcon />}
          isSmall
          type="ghost"
        >
          <span className="hidden md:block">Import token</span>
        </Button>
      </div>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false)
          resetField("ledgerID")
          resetField("indexID")
          setTokenInfo(null)
          setIsLoading(false)
        }}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl"
      >
        <div>
          <p className="text-2xl font-bold pb-[16px]">Import token</p>
          <Input
            id="ledgerID"
            labelText="Ledger canister ID"
            errorText={isLoading ? undefined : errors.ledgerID?.message}
            {...register("ledgerID", validationConfig)}
          />
          <div className="mb-3"></div>
          <Input
            id="indexID"
            labelText="Index canister ID (optional)"
            errorText={isLoading ? undefined : errors.indexID?.message}
            {...register("indexID", validationConfig)}
            disabled={!!errors.ledgerID || !getValues("ledgerID").length}
          />
          <p className="text-gray-400 text-xs mt-[5px] mb-[10px]">
            Required for deposit history
          </p>
          <BlurredLoader
            isLoading={isLoading}
            className="flex flex-col flex-1"
            overlayClassnames="rounded-xl"
            id="import"
          >
            <div className="min-h-[140px] text-sm flex">
              {tokenInfo && (
                <div className="bg-gray-50 rounded-[6px] p-4 text-gray-500 w-full">
                  <div className="grid grid-cols-[110px,1fr] gap-3">
                    <p>Token icon</p>
                    {tokenInfo.logo ? (
                      <img
                        className="rounded-full"
                        src={tokenInfo.logo}
                        alt="Token logo"
                        width={36}
                      />
                    ) : (
                      <UnknownIcon />
                    )}
                  </div>
                  <div className="grid grid-cols-[110px,1fr] gap-3 my-4">
                    <p>Token symbol</p>
                    <p className="text-black">{tokenInfo.symbol}</p>
                  </div>
                  <div className="grid grid-cols-[110px,1fr] gap-3">
                    <p>Token name</p>
                    <p className="text-black">{tokenInfo.name}</p>
                  </div>
                </div>
              )}
            </div>
          </BlurredLoader>
          <Warning
            title="Token safety"
            text="contains a list of known ICRC-1 canisters. Import others with caution."
            link={{
              text: "NFID’s Knowledge Base",
              url: "https://learn.nfid.one/",
            }}
          />
          <Button
            className="text-base"
            id="importToken"
            icon={<PlusIcon />}
            block
            type="primary"
            onClick={handleSubmit(submit)}
            disabled={
              Boolean(!tokenInfo) ||
              Object.values(errors).some((error) => error)
            }
          >
            Import custom token
          </Button>
        </div>
      </ModalComponent>
    </>
  )
}
