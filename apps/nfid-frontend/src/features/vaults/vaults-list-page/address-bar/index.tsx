import clsx from "clsx"
import React from "react"

import { Copy, Loader, CenterEllipsis, Card } from "@nfid/ui"

import { useVaultMember } from "../../hooks/use-vault-member"

export interface VaultAddressBarProps {}

export const VaultAddressBar: React.FC<VaultAddressBarProps> = () => {
  const { address } = useVaultMember()

  return (
    <>
      <Card
        classNames="mb-[30px]"
        text={
          <>
            <b>NFID Vaults has grown up!</b> The Vaults you know and love are
            now available as a separate dapp specifically designed to streamline
            multi-sig asset management. Just connect your NFID Wallet to{" "}
            <a
              className="text-primaryButtonColor"
              target="_blank"
              rel="noreferrer"
              href="https://nfidvaults.com"
            >
              https://nfidvaults.com
            </a>
            .
          </>
        }
      />
      <div
        className={clsx(
          "p-[1.5px] bg-red-100 rounded-[13px] bg-gradient-to-r",
          "from-teal-300 via-blue to-purple",
        )}
      >
        <div
          className={clsx(
            "p-5 flex items-center justify-between",
            "bg-white rounded-xl flex-wrap",
            "sm:space-x-16 sm:px-[30px] sm:flex-nowrap",
          )}
        >
          <div>
            <p className="font-semibold">NFID vault address</p>
            <p className="mt-1 text-sm">
              Share this identifier with vault administrators to add <br />
              you as an approver for vault transactions.
            </p>
          </div>
          <div
            className={clsx(
              "flex items-center justify-center bg-gray-100",
              "space-x-6 py-3 px-4 rounded-md font-bold text-sm",
              "mt-3 sm:mt-0",
            )}
          >
            {address ? (
              <>
                <CenterEllipsis
                  value={address ?? ""}
                  leadingChars={20}
                  trailingChars={3}
                />
                <Copy className="text-secondary" value={address ?? ""} />
              </>
            ) : (
              <Loader
                imageClasses="h-5 w-5"
                fullscreen={false}
                isLoading={true}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
