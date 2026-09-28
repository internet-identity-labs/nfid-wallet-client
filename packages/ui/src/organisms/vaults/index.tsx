import { FC, useEffect, useState } from "react"
import { VaultsSkeleton } from "../../atoms/skeleton/vaults-skeleton"
import { ReactComponent as ArrowLeft } from "../../atoms/icons/arrow.svg"
import { PlusIcon } from "../../atoms/icons/plus"
import clsx from "clsx"
import { CreateVaultModal } from "./components/create-modal"
import { E8S, TRILLION, TRIM_ZEROS } from "@nfid/integration/token/constants"
import { VaultCreationPriceFormatted, VaultsProps } from "./types"
import { Link } from "react-router-dom"

export const Vaults: FC<VaultsProps> = ({
  vaults,
  isLoading,
  createVault,
  getPrice,
  links,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [price, setPrice] = useState<VaultCreationPriceFormatted | undefined>()
  const [priceLoading, setPriceLoading] = useState(false)

  useEffect(() => {
    if (!isModalOpen) return
    const getVaultCreationPrice = async () => {
      setPriceLoading(true)
      const price = await getPrice()
      if (!price) return

      setPrice({
        icpPrice: `${(Number(price.costE8s) / E8S).toFixed(8).replace(TRIM_ZEROS, "")} ICP`,
        cyclePrice: `${(Number(price.totalCycles) / TRILLION).toFixed(2)} T Cycles balance post-deployment`,
      })
      setPriceLoading(false)
    }

    getVaultCreationPrice()
  }, [isModalOpen, getPrice])

  return (
    <>
      <CreateVaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createVault}
        price={price}
        priceLoading={priceLoading}
      />
      <div className="my-[30px] font-inter">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-[30px]">
          {isLoading || !vaults ? (
            <VaultsSkeleton />
          ) : vaults.length > 0 ? (
            vaults.map((vault, index) => (
              <Link
                to={`${links.vaults}/${vault.canisterId}`}
                className={clsx(
                  "h-[100px] sm:h-[126px] rounded-[24px] bg-portfolioColor dark:bg-zinc-800 p-[20px] sm:p-[30px] transition-all cursor-pointer",
                  "flex flex-col justify-between items-start  border-2 border-portfolioHoverColor hover:bg-portfolioHoverColor hover:border-portfolioBorderColor",
                  "group dark:border-zinc-800 dark:hover:bg-portfolioDarkHoverColor dark:hover:border-teal-500",
                )}
                key={`${vault.createdAt}_${vault.canisterId}`}
              >
                <p className="font-semibold tracking-[0.3] text-zinc-500 leading-[18px] text-sm">
                  0{index + 1}
                </p>
                <p className="relative font-semibold leading-[32px] group-hover:underline">
                  {vault.name}
                  <ArrowLeft
                    className={clsx(
                      "rotate-[180deg] absolute w-[18px] h-[18px] top-0 bottom-0 left-[calc(100%+10px)]",
                      "my-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-transform duration-200",
                    )}
                  />
                </p>
              </Link>
            ))
          ) : (
            "empty"
          )}
          <div
            className={clsx(
              "col-start-1 h-[100px] sm:h-[126px] rounded-[24px] cursor-pointer",
              "border-1 border-gray-200 dark:border-zinc-800 px-[30px] flex items-center gap-2.5",
              isLoading && "hidden",
            )}
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="w-6 h-6" />
            <div className="font-semibold leading-[32px]">
              Create a new NFID Vault
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
