import { debounce } from "@dfinity/utils"
import clsx from "clsx"
import { CANISTER_ID_LENGTH } from "packages/constants"
import { FC, useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { IoIosSearch } from "react-icons/io"
import { toast } from "react-toastify"
import { mutate } from "swr"

import {
  BlurredLoader,
  Button,
  IconCmpArrow,
  IconInfo,
  Input,
  Tooltip,
  Warning,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"
import { DEFAULT_ERROR_TEXT } from "@nfid/integration/token/constants"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { ICRC1Error, ICRC1Metadata } from "@nfid/integration/token/icrc1/types"

import { FT } from "frontend/integration/ft/ft"
import { PlusIcon } from "frontend/ui/atoms/icons/plus"
import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import { FilteredToken } from "./filtered-asset"

interface ProfileAssetsHeaderProps {
  tokens: FT[]
  isLoading: boolean
  setSearch: (v: string) => void
}

export const ProfileAssetsHeader: FC<ProfileAssetsHeaderProps> = ({
  tokens,
  isLoading,
  setSearch,
}) => {
  const [modalStep, setModalStep] = useState<"manage" | "import" | null>(null)
  const [tokenInfo, setTokenInfo] = useState<ICRC1Metadata | null>(null)
  const [isImportLoading, setIsImportLoading] = useState(false)

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value)
    }, 300),
    [setSearch],
  )

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

  let icrc1Pair = new Icrc1Pair(getValues("ledgerID"), getValues("indexID"))

  useEffect(() => {
    if (errors.ledgerID) {
      resetField("indexID")
      setTokenInfo(null)
    }
  }, [errors.ledgerID, resetField])

  const submit = async () => {
    try {
      setIsImportLoading(true)
      await icrc1Pair.storeSelf()
      toast.success(`${tokenInfo?.name ?? "Token"} has been added.`)
      setModalStep("manage")
      mutate((key) => Array.isArray(key) && key[0] === "filteredTokens")
      resetField("ledgerID")
      resetField("indexID")
      setTokenInfo(null)
    } catch (e) {
      console.error(e)
    } finally {
      setIsImportLoading(false)
    }
  }

  const fetchICRCToken = async () => {
    try {
      await Promise.all([
        icrc1Pair.validateIfExists(),
        icrc1Pair.validateStandard(),
        icrc1Pair.validateIndexCanister(),
      ])

      const data = await icrc1Pair.getMetadata()

      setTokenInfo(data)
      return true
    } catch (e) {
      if (e instanceof ICRC1Error) {
        return e.message
      } else {
        return DEFAULT_ERROR_TEXT
      }
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
          className={clsx("px-[10px] md:flex pr-[15px] text-teal-600")}
          id="importToken"
          onClick={() => setModalStep("manage")}
          isSmall
          type="ghost"
        >
          <span>Manage token</span>
        </Button>
      </div>
      <ModalComponent
        isVisible={Boolean(modalStep)}
        onClose={() => {
          setModalStep(null)
          setSearch("")
        }}
        className="p-5 w-[95%] md:w-[450px] z-[100] !rounded-[24px]"
      >
        {modalStep === "manage" && (
          <BlurredLoader
            isLoading={isLoading}
            overlayClassnames="rounded-[24px]"
          >
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
              <div className="h-[484px] overflow-auto">
                <div className="flex gap-[10px]">
                  <Input
                    className="h-[40px] w-full"
                    id="search"
                    placeholder="Search by token name"
                    icon={<IoIosSearch size="20" className="text-gray-400" />}
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                  <Button
                    isSmall
                    icon={<PlusIcon className="w-[18px]" />}
                    onClick={() => setModalStep("import")}
                  >
                    Import
                  </Button>
                </div>
                <div>
                  {tokens.map((token) => {
                    if (!token.isHideable()) return
                    return (
                      <FilteredToken key={token.getTokenName()} token={token} />
                    )
                  })}
                </div>
              </div>
            </div>
          </BlurredLoader>
        )}
        {modalStep === "import" && (
          <BlurredLoader
            isLoading={isImportLoading}
            overlayClassnames="rounded-[24px]"
            id="import"
          >
            <div className="h-[540px]">
              <div className="flex gap-[10px] items-center mb-[16px]">
                <IconCmpArrow
                  className="cursor-pointer"
                  onClick={() => setModalStep("manage")}
                />
                <p className="text-[20px] leading-[40px] font-bold">
                  Import token
                </p>
              </div>
              <Input
                id="ledgerID"
                labelText="Ledger canister ID"
                errorText={
                  isImportLoading ? undefined : errors.ledgerID?.message
                }
                {...register("ledgerID", validationConfig)}
              />
              <Input
                className="mt-[22px]"
                id="indexID"
                labelText="Index canister ID (optional)"
                errorText={
                  isImportLoading ? undefined : errors.indexID?.message
                }
                {...register("indexID", validationConfig)}
                disabled={!!errors.ledgerID || !getValues("ledgerID").length}
              />
              <p className="text-gray-400 text-xs mt-[5px] mb-[10px] h-[16px]">
                {!errors.indexID
                  ? "Required to display transaction history"
                  : ""}
              </p>
              <div className="h-[155px] text-sm flex">
                {tokenInfo && (
                  <div className="grid w-full h-full grid-rows-3">
                    <div className="grid grid-cols-[130px,1fr] border-b border-gray-100 items-center">
                      <p>Token icon</p>
                      <ImageWithFallback
                        alt="NFID token"
                        className="rounded-full w-[36px]"
                        fallbackSrc={IconNftPlaceholder}
                        src={`${tokenInfo.logo}`}
                      />
                    </div>
                    <div className="grid grid-cols-[130px,1fr] border-b border-gray-100 items-center">
                      <p>Token symbol</p>
                      <p className="text-black">{tokenInfo.symbol}</p>
                    </div>
                    <div className="grid grid-cols-[130px,1fr] border-b border-gray-100 items-center">
                      <p>Token name</p>
                      <p className="text-black">{tokenInfo.name}</p>
                    </div>
                  </div>
                )}
              </div>
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
                  submit()
                }}
                disabled={
                  Boolean(!tokenInfo) ||
                  Object.values(errors).some((error) => error)
                }
              >
                Import custom token
              </Button>
            </div>
          </BlurredLoader>
        )}
      </ModalComponent>
    </>
  )
}