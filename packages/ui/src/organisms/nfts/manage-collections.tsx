/* eslint-disable @nx/enforce-module-boundaries */
import { debounce } from "@nfid-frontend/utils"
import clsx from "clsx"
import { motion } from "framer-motion"
import { CANISTER_ID_LENGTH } from "packages/constants"
import { PlusIcon } from "packages/ui/src/atoms/icons/plus"
import toaster from "packages/ui/src/atoms/toast"
import { ModalComponent } from "@nfid-frontend/ui"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { IoIosSearch } from "react-icons/io"

import {
  BlurredLoader,
  Button,
  IconCmpArrow,
  IconInfo,
  IconInfoDark,
  Input,
  Tooltip,
  Card,
  ImageWithFallback,
  IconNftPlaceholder,
} from "@nfid-frontend/ui"
import { icrc7RegistryService } from "@nfid/integration/marketplace"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { NftCollectionWithState } from "frontend/features/collectibles"

import { useDarkTheme } from "frontend/hooks"
import { Spinner } from "../../atoms/spinner"

import {
  IconSvgEyeClosed,
  IconSvgEyeShown,
  IconSvgEyeShownWhite,
} from "@nfid-frontend/ui"

export interface NftCollectionMetadata {
  name: string
  symbol: string
  logo?: string
  description?: string
}

interface ManageCollectionsProps {
  collections: NftCollectionWithState[]
  onSubmitCollection: (canisterId: string) => Promise<void>
  onFetch: (canisterId: string) => Promise<NftCollectionMetadata>
  onUpdate?: () => Promise<void>
  manageBtnDisabled?: boolean
}

export const ManageCollections: FC<ManageCollectionsProps> = ({
  collections,
  onSubmitCollection,
  onFetch,
  onUpdate,
  manageBtnDisabled,
}) => {
  const isDarkTheme = useDarkTheme()
  const [modalStep, setModalStep] = useState<"manage" | "import" | null>(null)
  const [collectionInfo, setCollectionInfo] =
    useState<NftCollectionMetadata | null>(null)
  const [isImportLoading, setIsImportLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [loadingCollection, setLoadingCollection] = useState<string | null>(
    null,
  )

  const hideCollection = useCallback(
    async (collection: NftCollectionWithState) => {
      try {
        setLoadingCollection(collection.canisterId)
        await icrc7RegistryService.storeCollection(
          collection.canisterId,
          State.Inactive,
        )
        await onUpdate?.()
      } catch (e) {
        toaster.error("Hiding collection failed: " + (e as Error).message)
      } finally {
        setLoadingCollection(null)
      }
    },
    [onUpdate],
  )

  const showCollection = useCallback(
    async (collection: NftCollectionWithState) => {
      try {
        setLoadingCollection(collection.canisterId)
        await icrc7RegistryService.storeCollection(
          collection.canisterId,
          State.Active,
        )
        await onUpdate?.()
      } catch (e) {
        toaster.error("Showing collection failed: " + (e as Error).message)
      } finally {
        setLoadingCollection(null)
      }
    },
    [onUpdate],
  )

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    [],
  )

  const {
    register,
    formState: { errors },
    resetField,
    getValues,
  } = useForm({
    mode: "all",
    defaultValues: {
      canisterId: "",
    },
  })

  useEffect(() => {
    if (modalStep !== "import") {
      setCollectionInfo(null)
      resetField("canisterId")
    }
  }, [modalStep, resetField])

  const submit = async () => {
    try {
      setIsImportLoading(true)
      await onSubmitCollection(getValues("canisterId"))
      toaster.success(`${collectionInfo?.name ?? "Collection"} has been added.`)
      resetField("canisterId")
      setCollectionInfo(null)
    } catch (e) {
      console.error(e)
      toaster.error("Adding collection failed")
    } finally {
      setModalStep(null)
      debouncedSearch("")
      setIsImportLoading(false)
    }
  }

  const fetchCollectionInfo = async () => {
    const id = getValues("canisterId")
    if (!id) {
      setCollectionInfo(null)
      return true
    }
    if (collections.some((c) => c.canisterId === id))
      return "Canister already added"
    try {
      const data = await onFetch(id)
      setCollectionInfo(data)
      return true
    } catch (e) {
      setCollectionInfo(null)
      const msg = (e as Error).message ?? ""
      if (
        msg.toLowerCase().includes("checksum") ||
        msg.toLowerCase().includes("principal") ||
        msg.toLowerCase().includes("has no query method")
      )
        console.error(msg)
      return "This does not appear to be an ICRC-7 compatible canister."
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
    validate: fetchCollectionInfo,
  }

  const filteredCollections = useMemo(() => {
    if (search.length > 0) {
      const q = search.toLowerCase()
      return collections.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.canisterId.includes(q) ||
          c.symbol.toLowerCase().includes(q),
      )
    }
    return collections
  }, [collections, search])

  return (
    <>
      <Button
        type="ghost"
        isSmall
        onClick={() => setModalStep("manage")}
        id="manageCollection"
        className={clsx("flex items-center space-x-6 shrink-0 w-[167px]")}
        disabled={!!manageBtnDisabled}
      >
        Manage collections
      </Button>
      <ModalComponent
        isVisible={Boolean(modalStep)}
        onClose={() => {
          setModalStep(null)
          setCollectionInfo(null)
          debouncedSearch("")
          resetField("canisterId")
        }}
        className="px-5 py-3 w-[95%] md:w-[450px] z-[100] !rounded-[24px] relative"
      >
        {modalStep === "manage" && (
          <motion.div
            key="manage-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between h-[40px]">
              <p className="text-[20px] leading-[24px] font-bold dark:text-white">
                Manage collections
              </p>
              <Tooltip
                className="!p-[16px] !w-[300px]"
                align="end"
                alignOffset={-20}
                tip={
                  <div className="text-white text-xs leading-[16px]">
                    Collection management support is currently <br />
                    limited to the ICRC-7 NFT standard.
                  </div>
                }
              >
                <img
                  src={isDarkTheme ? IconInfoDark : IconInfo}
                  alt="icon"
                  className="w-[20px] h-[20px] transition-all cursor-pointer hover:opacity-70"
                />
              </Tooltip>
            </div>
            <div>
              <div className="flex gap-[10px] mt-[10px] mb-5">
                <div className="relative w-full">
                  <Input
                    inputClassName="!border-black dark:!border-zinc-500"
                    className="h-[40px] w-full !mb-0"
                    id="search"
                    placeholder="Search by collection"
                    icon={<IoIosSearch size="20" className="text-gray-400" />}
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                </div>
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
                  "h-[476px] overflow-auto pr-[16px]",
                  "scrollbar scrollbar-w-4 scrollbar-thumb-gray-300",
                  "scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
                  "dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-[#242427]",
                )}
              >
                {filteredCollections.map((collection) => (
                  <div
                    className="flex items-center gap-3 h-[60px]"
                    key={collection.canisterId}
                  >
                    <ImageWithFallback
                      alt={collection.name}
                      fallbackSrc={IconNftPlaceholder}
                      src={collection.logo ?? "#"}
                      className="w-12 h-12 object-cover rounded-[12px]"
                    />
                    <div>
                      <div className="text-sm font-semibold leading-5 dark:text-white mb-0.5">
                        {collection.name}
                      </div>
                      <div className="text-xs leading-5 text-secondary dark:text-zinc-500">
                        {collection.symbol}
                      </div>
                    </div>
                    <div className="ml-auto">
                      {loadingCollection === collection.canisterId ? (
                        <Spinner />
                      ) : (
                        <img
                          id={`${collection.canisterId}_showHideButton`}
                          className="cursor-pointer"
                          src={
                            collection.state !== State.Active
                              ? IconSvgEyeClosed
                              : isDarkTheme
                                ? IconSvgEyeShownWhite
                                : IconSvgEyeShown
                          }
                          alt="Toggle collection visibility"
                          onClick={() =>
                            collection.state === State.Active
                              ? hideCollection(collection)
                              : showCollection(collection)
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {modalStep === "import" && (
          <motion.div
            key="import-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <BlurredLoader
              isLoading={isImportLoading}
              className="!h-fit"
              overlayClassnames="rounded-[24px] absolute !left-0 !top-0 !bottom-0 !right-0"
              id="import"
            >
              <div className="h-[576px] flex flex-col">
                <div className="flex gap-[10px] items-center mb-[16px]">
                  <IconCmpArrow
                    className="cursor-pointer dark:text-white"
                    onClick={() => {
                      setModalStep("manage")
                      debouncedSearch("")
                    }}
                  />
                  <p className="text-[20px] leading-[40px] font-bold dark:text-white">
                    Import collection
                  </p>
                </div>
                <Input
                  className="!mb-0"
                  id="canisterId"
                  labelText="Canister ID"
                  errorText={
                    isImportLoading ? undefined : errors.canisterId?.message
                  }
                  {...register("canisterId", validationConfig)}
                />
                <div className={clsx("text-sm flex mt-6")}>
                  {collectionInfo && (
                    <div className="grid w-full h-full grid-rows-3">
                      <div className="grid grid-cols-[130px_1fr] border-b border-gray-100 items-center h-[54px] dark:text-white">
                        <p>Collection logo</p>
                        <ImageWithFallback
                          alt="Collection logo"
                          className="rounded-[8px] w-[36px] h-[36px] object-cover"
                          fallbackSrc={IconNftPlaceholder}
                          src={collectionInfo.logo ?? "#"}
                        />
                      </div>
                      <div className="grid grid-cols-[130px_1fr] border-b border-gray-100 items-center h-[54px] dark:text-white">
                        <p>Collection symbol</p>
                        <p className="text-black dark:text-white">
                          {collectionInfo.symbol}
                        </p>
                      </div>
                      <div className="grid grid-cols-[130px_1fr] border-b border-gray-100 items-center h-[54px] dark:text-white">
                        <p>Collection name</p>
                        <p className="text-black dark:text-white">
                          {collectionInfo.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-[130px_1fr] pt-4 h-[98px] dark:text-white">
                        <p>Description</p>
                        <p className="overflow-auto text-black dark:text-white">
                          {collectionInfo.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <Card
                  className="mt-auto mb-0"
                  text={
                    <>
                      <b>Collection safety.</b> Only import ICRC-7 collections
                      that you trust and whose authenticity you can verify.
                    </>
                  }
                />
                <Button
                  className="mt-2.5 text-base"
                  id="importCollection"
                  icon={<PlusIcon />}
                  block
                  type="primary"
                  onClick={(event) => {
                    event.preventDefault()
                    submit()
                  }}
                  disabled={
                    Boolean(!collectionInfo) ||
                    Object.values(errors).some((error) => error)
                  }
                >
                  Import custom collection
                </Button>
              </div>
            </BlurredLoader>
          </motion.div>
        )}
      </ModalComponent>
    </>
  )
}
