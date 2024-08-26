import clsx from "clsx"
import {
  ICRC1Data,
  addICRC1Canister,
  isICRC1Canister,
  ICRC1Error,
} from "packages/integration/src/lib/token/icrc1"
import { NoIcon } from "packages/ui/src/assets/no-icon"
import { FC, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { IoIosSearch } from "react-icons/io"
import { toast } from "react-toastify"
import { mutate } from "swr"

import {
  ApplicationIcon,
  BlurredLoader,
  Button,
  IconCmpArrow,
  IconInfo,
  Input,
  Tooltip,
  Warning,
  IconSvgEyeClosed,
  IconSvgEyeShown,
} from "@nfid-frontend/ui"
import { DEFAULT_ERROR_TEXT } from "@nfid/integration/token/constants"

import { CANISTER_ID_LENGTH } from "frontend/features/transfer-modal/utils/validations"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { resetCachesByKey } from "frontend/ui/connnector/cache"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { Token } from ".."

interface ProfileAssetsHeaderProps {
  tokens: Token[]
}

export const ProfileAssetsHeader: FC<ProfileAssetsHeaderProps> = ({
  tokens,
}) => {
  const [modalStep, setModalStep] = useState<"manage" | "import" | null>(null)
  const [tokenInfo, setTokenInfo] = useState<ICRC1Data | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenManageToken = () => {
    setModalStep("manage")
  }

  const {
    register,
    formState: { errors },
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
      toast.success(`${tokenInfo?.name ?? "Token"} has been added.`)
      setModalStep("manage")
      resetCachesByKey(
        [
          `ICRC1TransferConnector:getTokensOptions:[]`,
          `ICRC1TransferConnector:getTokens:[]`,
        ],
        () =>
          mutate(
            (key) => Array.isArray(key) && key[1] === "getAllTokensOptions",
          ),
      )
      mutate("getICRC1Data")
      mutate((key) => Array.isArray(key) && key[0] === "useTokenConfig")
      resetField("ledgerID")
      resetField("indexID")
      setTokenInfo(null)
      setIsLoading(false)
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
      <div className="flex items-center justify-end w-full">
        <Button
          className={clsx("px-[10px] md:flex pr-0 md:pr-[15px] text-teal-600")}
          id="importToken"
          onClick={handleOpenManageToken}
          isSmall
          type="ghost"
        >
          <span>Manage token</span>
        </Button>
      </div>
      <ModalComponent
        isVisible={modalStep !== null}
        onClose={() => {
          setModalStep(null)
          resetField("ledgerID")
          resetField("indexID")
          setTokenInfo(null)
          setIsLoading(false)
        }}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl"
      >
        {modalStep === "manage" && (
          <div>
            <div className="flex items-center justify-between h-[40px] mb-[16px]">
              <p className="text-[20px] leading-[24px]">Manage tokens</p>
              <Tooltip
                className="!p-[16px] !w-[320px]"
                tip={
                  <div className="text-white text-xs leading-[16px]">
                    <p className="mb-2 font-bold">Category</p>
                    <ul className="list-disc ml-[18px]">
                      <li>
                        SNS tokens - tokens that have gone through the SNS
                        launchpad
                      </li>
                      <li>
                        Chain Fusion tokens - DFINITY-implemented wrapped
                        cross-chain tokens
                      </li>
                      <li>
                        Chain Fusion Testnet tokens - DFINITY-implemented
                        wrapped cross-chain testnet tokens
                      </li>
                      <li>Known tokens - trustworthy reputation</li>
                      <li>
                        Community tokens - added by the community, but not yet
                        classified as 'trustworthy’
                      </li>
                      <li>Spam tokens - marked as spam by NFID team</li>
                    </ul>
                  </div>
                }
              >
                <img
                  src={IconInfo}
                  alt="icon"
                  className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                />
              </Tooltip>
            </div>
            <div className="flex gap-[10px] mb-[20px]">
              <Input
                className="h-[40px] w-full"
                id="search"
                placeholder="Search by token name"
                icon={<IoIosSearch size="20" className="text-gray-400" />}
              />
              <Button
                isSmall
                icon={<PlusIcon className="w-[18px]" />}
                onClick={() => setModalStep("import")}
              >
                Import
              </Button>
            </div>
            <div className="">
              {tokens.map((token) => {
                return (
                  <div className="flex items-center justify-between h-16">
                    <div className="flex items-center justify-center gap-[12px]">
                      <div className="w-[40px] h-[40px]">
                        <ApplicationIcon
                          className="mr-[12px]"
                          icon={token.icon}
                          appName={token.title}
                        />
                      </div>
                      <div className="basis-[160px]">
                        <p className="text-sm text-black leading-[20px] font-semibold">
                          {token.currency}
                        </p>
                        <p className="text-xs text-secondary leading-[20px]">
                          {token.title}
                        </p>
                      </div>
                    </div>
                    <div>Category?</div>
                    <div>
                      <img
                        className="cursor-pointer"
                        src={IconSvgEyeShown}
                        alt=""
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {modalStep === "import" && (
          <div>
            <div className="flex gap-[10px] items-center mb-[16px]">
              <IconCmpArrow
                className="cursor-pointer"
                onClick={() => setModalStep("manage")}
              />
              <p className="text-2xl font-bold">Import token</p>
            </div>
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
            {!errors.indexID && (
              <p className="text-gray-400 text-xs mt-[5px] mb-[10px]">
                Required to display transaction history
              </p>
            )}
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
                        <NoIcon className="w-[36px] h-[36px]" />
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
              text={
                <>
                  <b>Token safety.</b> Always only import ICRC-1 tokens you
                  trust and can verify the authenticity of.
                </>
              }
            />
            <Button
              className="text-base"
              id="importToken"
              icon={<PlusIcon />}
              block
              type="primary"
              onClick={(event) => {
                event.preventDefault()
                submit({
                  ledgerID: getValues("ledgerID"),
                  indexID: getValues("indexID"),
                })
              }}
              disabled={
                Boolean(!tokenInfo) ||
                Object.values(errors).some((error) => error)
              }
            >
              Import custom token
            </Button>
          </div>
        )}
      </ModalComponent>
    </>
  )
}
