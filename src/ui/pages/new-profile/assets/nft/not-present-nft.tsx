import clsx from "clsx"
import React from "react"

import { NFTDetails } from "frontend/integration/entrepot/types"
import { Loader } from "frontend/ui/atoms/loader"
import ProfileContainer from "frontend/ui/templates/profile-container/Container"

import WithoutNFT from "./assets/NFTComing.png"

interface IProfileNFTNotPresent extends React.HTMLAttributes<HTMLDivElement> {
  nfts?: NFTDetails[]
}

export const ProfileNFTNotPresent: React.FC<IProfileNFTNotPresent> = ({
  nfts,
}) => {
  return (
    <ProfileContainer
      title="Your NFTs"
      className={clsx("pb-40", "sm:pb-[26px] mt-[30px] relative")}
    >
      {typeof nfts === "undefined" ? (
        <div className="flex items-center justify-center w-full h-full p-10">
          <Loader imageClasses="h-20" isLoading={true} fullscreen={false} />
        </div>
      ) : (
        <>
          <div className="text-neutral-900 text-sm leading-5 max-w-[320px] z-20 relative">
            <p>
              NFTs in the EXT standard you received to your main NFID wallet or
              any application where you signed in with NFID will be listed here.
              If you’ve connected your II anchor with NFID, EXT NFTs in those
              connected wallets will also be available.
            </p>
            <p className="mt-4">
              Email us at{" "}
              <a
                href="mailto:hello@identitylabs.ooo"
                className="text-blue-600 transition-opacity hover:opacity-50"
              >
                hello@identitylabs.ooo
              </a>{" "}
              for support.
            </p>
          </div>
          <img
            src={WithoutNFT}
            alt="Coming soon"
            className={clsx(
              "-bottom-32 -right-[80px] w-[110vw]",
              "sm:top-0 sm:-right-[30px] sm:w-2/3",
              "absolute z-10 max-w-none",
            )}
          />
        </>
      )}
    </ProfileContainer>
  )
}
