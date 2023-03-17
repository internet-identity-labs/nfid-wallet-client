import clsx from "clsx"
import { useState } from "react"

import { IconCmpArrow, IconCmpArrowRight } from "@nfid-frontend/ui"
import { Item } from "@nfid/integration-ethereum"

export interface IBatchAssetPreview {
  items: { item: { data: Item } }[]
}

export const BatchAssetPreview = ({ items }: IBatchAssetPreview) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      {isModalOpen && (
        <div className="absolute top-0 z-30 w-full h-full bg-white">
          <div className="flex items-center mb-5">
            <div
              className="cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              <IconCmpArrow />
            </div>
            <p className="ml-2 text-xl font-bold">
              {items.length} collectibles
            </p>
          </div>
          <div>
            {items.map((item) => {
              return (
                <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                  <div className="flex items-center">
                    <img
                      className="object-cover w-12 h-12 rounded-md mr-2.5"
                      src={item?.item?.data?.meta?.content[0]?.url}
                      alt=""
                    />
                    <div>
                      <p className="text-sm">{item?.item?.data?.meta?.name}</p>
                      <p className="text-xs text-gray-400">
                        {item?.item?.data?.collectionData?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-sm">0</p>
                    <p className="text-xs text-gray-400">0$</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div
        className={clsx(
          "pr-4 overflow-hidden border border-gray-200 rounded-md cursor-pointer h-20",
          "flex items-center justify-between",
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-full w-28">
          {items.slice(0, 3).map((item, index) => {
            return (
              <img
                src={item?.item?.data?.meta?.content[0]?.url}
                alt=""
                className={clsx(
                  "absolute top-0 w-20 h-20",
                  `left-[${index * 5}px]`,
                )}
              />
            )
          })}
        </div>
        <div>
          <p className="font-bold">{Array.length} collectibles</p>
          <p className="w-64 overflow-hidden text-sm text-gray-400 truncate text-ellipsis">
            {items
              .map((item) => item?.item?.data?.meta?.name ?? "Unknown name")
              .join(", ")}
          </p>
        </div>
        <IconCmpArrowRight />
      </div>
    </div>
  )
}
