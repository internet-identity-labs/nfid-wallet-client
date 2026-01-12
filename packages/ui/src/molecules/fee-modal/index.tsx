import clsx from "clsx"
import { useState } from "react"

import { IconCmpArrow } from "../../atoms/icons"
import { CustomNetworkFee } from "./custom"
import { IFeeModalOption } from "./option"

export interface IFeeModal {
  feeOptions: IFeeModalOption[]
}

export const FeeModal = ({ feeOptions: _feeOptions }: IFeeModal) => {
  const [isModalVisible, setIsModalVisible] = useState(true)

  return (
    <div
      className={clsx(
        "p-5 absolute w-full h-full z-50 left-0 top-0 bg-frameBgColor",
        "flex flex-col rounded-xl",
        !isModalVisible && "hidden",
      )}
    >
      <div className="flex justify-between">
        <div className="flex items-center">
          <div
            className="cursor-pointer"
            onClick={() => setIsModalVisible(false)}
          >
            <IconCmpArrow className="mr-2" />
          </div>
          <p className="text-xl font-bold">Adjust network fee</p>
        </div>
      </div>
      {/* <p className="mt-4">Estimated times based on each price</p>
        <div className="flex flex-col space-y-1 mt-3.5">
          {feeOptions.map((option, index) => (
            <FeeModalOption
              key={`networkFeeOption-${index}`}
              title={option.title}
              subTitle={option.subTitle}
              innerTitle={option.innerTitle}
              innerSubtitle={option.innerSubtitle}
              onClick={option.onClick}
              onConfig={option.onConfig}
            />
          ))}
        </div> */}
      <CustomNetworkFee />
    </div>
  )
}
