import clsx from "clsx"
import React, { useState } from "react"

import {
  IconCmpArrow,
  IconCmpArrowRight,
  IconSvgNFTPreview,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"

import { IAsset } from "."

interface IBatchAssetPreview {
  assets: IAsset[]
}

export const BatchAssetPreview: React.FC<IBatchAssetPreview> = ({ assets }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      {isModalOpen && (
        <div className="absolute top-0 left-0 z-30 w-full h-full p-[22px] bg-white">
          <div className="flex items-center mb-5">
            <div
              className="cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              <IconCmpArrow />
            </div>
            <p className="ml-2 text-xl font-bold">
              {assets.length} collectibles
            </p>
          </div>
          <div className="space-y-1.5">
            {assets.map((item) => {
              return (
                <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                  <div className="flex items-center">
                    <img
                      className="object-cover w-12 h-12 rounded-md mr-2.5"
                      src={item?.icon}
                      alt=""
                    />
                    <div>
                      <p className="text-sm">{item?.title}</p>
                      <p className="text-xs text-gray-400">{item?.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-sm">{item.innerTitle}</p>
                    <p className="text-xs text-gray-400">
                      {item.innerSubtitle}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div
        className={clsx(
          "overflow-hidden border border-gray-200 rounded-md cursor-pointer h-20",
          "flex items-center",
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-full text-gray-100 w-[98px]">
          {assets.slice(0, 3).map((item, index) => {
            return (
              <img
                key={`preview_${index}`}
                alt={`preview_${index}`}
                src={item?.icon ?? IconSvgNFTPreview}
                className={clsx(
                  "border-x border-gray-200 border-opacity-50 rounded-[5px]",
                  "w-20 h-20 absolute top-0",
                )}
                style={{
                  left: `${index * 6}px`,
                }}
              />
            )
          })}
        </div>
        <div className="ml-2.5">
          <p className="font-bold">{assets.length} collectibles</p>
          <p className="w-64 overflow-hidden text-sm text-gray-400">
            {truncateString(
              assets.map((item) => item.title ?? "Unknown name").join(", "),
              63,
            )}
          </p>
        </div>
        <IconCmpArrowRight className="ml-auto mr-4" />
      </div>
    </div>
  )
}
