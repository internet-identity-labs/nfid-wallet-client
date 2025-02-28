import { debounce } from "@dfinity/utils"
import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"
import { CANISTER_ID_LENGTH } from "packages/constants"
import { PlusIcon } from "packages/ui/src/atoms/icons/plus"
import toaster from "packages/ui/src/atoms/toast"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import { FC, useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { IoIosSearch } from "react-icons/io"

import {
  BlurredLoader,
  Button,
  IconCmpArrow,
  IconInfo,
  Input,
  Tooltip,
  Card,
  ImageWithFallback,
  IconNftPlaceholder,
  Toggle,
  IconCmpArrowRight,
} from "@nfid-frontend/ui"
import { ICRC1Error } from "@nfid/integration/token/icrc1/types"

import { FT } from "frontend/integration/ft/ft"
import { ftService } from "frontend/integration/ft/ft-service"

import { FilteredToken } from "./filtered-asset"
import { ScanTokens } from "./scan-tokens"

export interface ICRC1Metadata {
  name: string
  symbol: string
  logo?: string
  decimals: number
  fee: bigint
}

interface TokensHeaderProps {
  tokens: FT[]
  onSubmitIcrc1Pair: (ledgerID: string, indexID: string) => Promise<void>
  onFetch: (
    ledgerID: string,
    indexID: string,
  ) => Promise<{
    name: string
    symbol: string
    logo: string | undefined
    decimals: number
    fee: bigint
  }>
  setLoadingToken: (value: FT | null) => void
  hideZeroBalance: boolean
  onZeroBalanceToggle: () => void
  manageBtnDisabled?: boolean
}

export const TokensHeader: FC<TokensHeaderProps> = ({
  tokens,
  onSubmitIcrc1Pair,
  onFetch,
  setLoadingToken,
  hideZeroBalance,
  onZeroBalanceToggle,
  manageBtnDisabled,
}) => {
  const [modalStep, setModalStep] = useState<
    "manage" | "import" | "scan" | null
  >(null)
  const [tokenInfo, setTokenInfo] = useState<ICRC1Metadata | null>(null)
  const [isImportLoading, setIsImportLoading] = useState(false)
  const [search, setSearch] = useState("")

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

  useEffect(() => {
    if (errors.ledgerID) {
      resetField("indexID")
      setTokenInfo(null)
    }
  }, [errors.ledgerID, resetField])

  const submit = async () => {
    try {
      setIsImportLoading(true)
      await onSubmitIcrc1Pair(getValues("ledgerID"), getValues("indexID"))
      toaster.success(`${tokenInfo?.name ?? "Token"} has been added.`)
      resetField("ledgerID")
      resetField("indexID")
      setTokenInfo(null)
    } catch (e) {
      console.error(e)
      toaster.error("Adding new token failed")
    } finally {
      setModalStep(null)
      debouncedSearch("")
      setIsImportLoading(false)
    }
  }

  const fetchICRCToken = async () => {
    try {
      const data = await onFetch(getValues("ledgerID"), getValues("indexID"))
      setTokenInfo(data)
      return true
    } catch (e) {
      return getValues("ledgerID") === "" ? true : (e as ICRC1Error).message
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
          disabled={!!manageBtnDisabled}
        >
          <span>Manage tokens</span>
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <ModalComponent
          isVisible={Boolean(modalStep)}
          onClose={() => {
            setModalStep(null)
            debouncedSearch("")
          }}
          className="p-5 w-[95%] md:w-[450px] z-[100] !rounded-[24px]"
        >
          {modalStep === "scan" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ScanTokens
                className="h-[calc(600px-2.5rem)]"
                onCancel={() => setModalStep("manage")}
                onScanned={() => setModalStep("manage")}
              />
            </motion.div>
          )}
          {modalStep === "manage" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between h-[40px]">
                <p className="text-[20px] leading-[24px] font-bold">
                  Manage tokens
                </p>
                <Tooltip
                  className="!p-[16px] !w-[320px]"
                  align="end"
                  alignOffset={-20}
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
              <div>
                <div className="bg-gray-50 rounded-[12px] mt-[28px] mb-[20px]">
                  <div className="h-[64px] px-4 flex items-center justify-between border-b border-white">
                    <span>Hide zero balances</span>
                    <Toggle
                      isChecked={hideZeroBalance}
                      onToggle={onZeroBalanceToggle}
                    />
                  </div>
                  <div
                    onClick={() => setModalStep("scan")}
                    className="h-[64px] px-4 flex items-center justify-between border-b border-white cursor-pointer"
                  >
                    <span>Scan for tokens</span>
                    <IconCmpArrowRight />
                  </div>
                </div>
                <div className="flex gap-[10px] mb-[10px]">
                  <Input
                    inputClassName="!border-black"
                    className="h-[40px] w-full "
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
                <div
                  className={clsx(
                    "h-[294px] overflow-auto pr-[16px]",
                    "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
                    "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
                  )}
                >
                  {ftService.filterTokens(tokens, search).map((token) => {
                    if (!token.isHideable()) return
                    return (
                      <FilteredToken
                        key={`${token.getTokenName()}_${token.getTokenAddress()}`}
                        token={token}
                        tokens={tokens}
                        setLoadingToken={setLoadingToken}
                      />
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
          {modalStep === "import" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <BlurredLoader
                isLoading={isImportLoading}
                className="!h-fit"
                overlayClassnames="rounded-[24px]"
                id="import"
              >
                <div className="h-[540px] flex flex-col">
                  <div className="flex gap-[10px] items-center mb-[16px]">
                    <IconCmpArrow
                      className="cursor-pointer"
                      onClick={() => {
                        setModalStep("manage")
                        debouncedSearch("")
                      }}
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
                    disabled={
                      !!errors.ledgerID || !getValues("ledgerID").length
                    }
                  />
                  {!errors.indexID && (
                    <p className="text-gray-400 text-xs mt-1 h-[16px]">
                      Required to display transaction history
                    </p>
                  )}
                  <div className={clsx("text-sm flex mt-auto")}>
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
                  <Card
                    text={
                      <>
                        <b>Token safety.</b> Always only import ICRC-1 tokens
                        you trust and can verify the authenticity of.
                      </>
                    }
                  />
                  <Button
                    className="mt-5 text-base"
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
            </motion.div>
          )}
        </ModalComponent>
      </AnimatePresence>
    </>
  )
}
