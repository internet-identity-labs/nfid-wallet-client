import clsx from "clsx"
import React from "react"

import { IconCmpNFIDWalletLogo, IconCmpShare } from "@nfid-frontend/ui"

import LeftBgApproval from "./left-bg-approval.svg"
import LeftBg from "./left-bg.svg"

interface RPCTemplateProps {
  isApproveRequestInProgress: boolean
  children: React.ReactNode
}

export const RPCTemplate: React.FC<RPCTemplateProps> = ({
  isApproveRequestInProgress,
  children,
}) => {
  return (
    <div
      className="grid min-h-screen grid-cols-1 bg-cover lg:grid-cols-2"
      style={{
        backgroundImage: `url(${LeftBg})`,
      }}
    >
      <div className="flex items-center lg:justify-center order-2 w-full lg:order-1 min-h-[375px] flex-wrap">
        {isApproveRequestInProgress ? (
          <img
            src={LeftBgApproval}
            alt="Left Background"
            className="absolute top-0 left-0 z-0 hidden object-cover h-screen lg:w-1/2 lg:block"
            loading="lazy"
          />
        ) : (
          <img
            src={LeftBg}
            alt="Left Background"
            className="absolute top-0 left-0 z-0 hidden object-cover h-screen lg:w-1/2 lg:block"
            loading="lazy"
          />
        )}
        <IconCmpNFIDWalletLogo className="text-white absolute top-[15px] left-[30px]" />
        <div className="xl:max-w-[32rem] max-w-[90%] mx-auto lg:mx-0 relative z-10">
          <p className="gradient-text text-[34px] lg:text-[2.9rem] xl:text-[3.2rem] font-bold leading-[120%]">
            {isApproveRequestInProgress
              ? "Transaction request"
              : "Your crypto wallet & gateway to ICP apps"}
          </p>
          <p className="font-inter text-white text-[20px] lg:text-[1.4rem] mt-[2rem] leading-[140%]">
            {isApproveRequestInProgress
              ? "Verify this transaction’s accuracy and make sure you trust the app requesting its approval."
              : "NFID Wallet is your on-chain wallet running end-to-end on the Internet Computer Protocol."}
          </p>
        </div>
        <a
          href="https://docs.nfid.one/"
          target="_blank"
          rel="noreferrer"
          className={clsx(
            "font-bold text-xs bg-[#0F766E] bg-opacity-10 rounded-md",
            "h-[29px] px-2.5 flex items-center gap-2.5 text-white",
            "lg:absolute z-10 bottom-[15px] ml-[5%] lg:ml-0 left-[30px]",
            "hover:bg-opacity-25 cursor-pointer",
          )}
        >
          <p>Learn more about NFID Wallet</p>
          <IconCmpShare />
        </a>
      </div>
      <div className="relative flex lg:items-center justify-center lg:bg-white order-1 lg:order-2 mt-20 lg:mt-0">
        <div className="h-fit min-h-[520px] lg:min-h-0 mx-auto w-[90%] sm:max-w-[387px] flex flex-col bg-white rounded-3xl lg:rounded-none overflow-hidden lg:overflow-auto relative lg:static p-5 lg:p-[10px]">
          {children}
        </div>
      </div>
    </div>
  )
}
