import clsx from "clsx"
import React from "react"
import { useForm } from "react-hook-form"
import { ImSpinner } from "react-icons/im"
import useSWR from "swr"

import { Button, H1, H2, H4, Input } from "@nfid-frontend/ui"
import { minMax } from "@nfid-frontend/utils"
import { getBalance } from "@nfid/integration"
import { requestTransfer, RequestTransferParams } from "@nfid/wallet"

import { PageTemplate } from "../page-template"
import NFTImage from "./nft-1.jpg"

const APPLICATION_LOGO_URL = "https%3A%2F%2Flogo.clearbit.com%2Fclearbit.com"

export const PageRequestTransfer: React.FC = () => {
  return (
    <PageTemplate
      title={"Request transfer"}
      className="grid w-full h-screen grid-cols-2 !p-0 divide-x"
    >
      <div className="p-5">
        <H4 className="mb-10">Authentication</H4>
        {/* Step 1: Authentication */}
        <Button type="primary">Authenticate</Button>
        <div className="w-full p-6 mt-4 bg-gray-900 rounded-lg shadow-md">
          <h3 className="mb-4 text-xl text-white">Authentication logs</h3>
          <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
            <code>
              {`{
  "principal": "User XYZ",
  "address": "0x1234...",
  "balance": "1.5 ETH"
}`}
            </code>
          </pre>
        </div>
      </div>

      <div className="flex flex-col p-5 space-y-4">
        <H4 className="mb-10">NFT Marketplace</H4>
        {/* Step 2: NFT Marketplace (Initially Disabled) */}
        <div className="grid grid-cols-3 gap-6 opacity-50 pointer-events-none">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="relative p-4 transition-shadow duration-300 bg-gray-900 rounded-xl group hover:shadow-xl"
            >
              <div className="relative mb-4 overflow-hidden rounded-md">
                <img
                  src={NFTImage}
                  alt={`NFT ${index + 1}`}
                  className="w-full transition-transform duration-300 transform group-hover:scale-105"
                />
                <div className="absolute p-1 text-sm text-white bg-gray-800 rounded-full bottom-2 left-2 bg-opacity-70">
                  {["0.5", "1.0", "0.7"][index]} ETH
                </div>
              </div>
              <h5 className="mb-2 text-lg text-white">NFT Title {index + 1}</h5>
              <p className="mb-4 text-sm text-gray-400">
                Limited edition digital art piece by NFID.
              </p>
              <Button type="primary" className="w-full">
                Purchase NFT
              </Button>
            </div>
          ))}
        </div>

        <div className="w-full p-6 mt-6 bg-gray-900 rounded-lg shadow-md">
          <h3 className="mb-4 text-xl text-white">Transfer logs</h3>
          <pre className="p-4 overflow-x-auto text-sm text-white bg-gray-800 rounded">
            <code>
              {`{
  "status": "Success",
  "message": "Purchase Successful"
}`}
            </code>
          </pre>
        </div>
      </div>
    </PageTemplate>
  )
}
