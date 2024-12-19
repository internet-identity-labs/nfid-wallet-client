import { useEffect } from "react"

import { Button } from "@nfid-frontend/ui"

import coinsImg from "./assets/coins.png"

import { SNS_STEP_VISITED } from "../../constants"

function Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 8.5V2M16 2H9.5M16 2L7.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 13.1427L14 14.0951C14 14.6003 13.7993 15.0848 13.4421 15.4421C13.0848 15.7993 12.6003 16 12.0951 16L3.90488 16C3.39967 16 2.91516 15.7993 2.55793 15.4421C2.20069 15.0848 2 14.6003 2 14.0951L2 5.90488C2 5.39968 2.20069 4.91516 2.55793 4.55793C2.91516 4.20069 3.39967 4 3.90488 4L4.85732 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TokenLaunch({ onSubmit }: { onSubmit: () => unknown }) {
  useEffect(() => {
    localStorage.setItem(SNS_STEP_VISITED, "true")
  }, [])

  return (
    <div className="mt-[-10px] h-full flex flex-col">
      <img className="w-full" src={coinsImg} alt="Token Launch" />
      <div className="mt-[-10px] flex flex-col flex-1">
        <h6 className="mb-[20px] text-base font-semibold">
          Take a stake in Web3’s fattest wallet with the $NFIDW token launch
        </h6>
        <p className="text-sm mb-[20px] block">
          The first wallet with the potential to let you pay on any chain, with
          any token, is now going fully decentralized!
        </p>
        <p className="text-sm mb-[20px] block">
          Don’t miss out on shaping the future of Web3 with NFID Wallet. Follow{" "}
          <a
            className="text-primaryButtonColor hover:text-teal-900"
            href="https://x.com/NFIDWallet"
            target="_blank"
            rel="noreferrer"
          >
            @NFIDWallet
          </a>{" "}
          and{" "}
          <a
            className="text-primaryButtonColor hover:text-teal-900"
            href="https://x.com/IdentityMaxis"
            target="_blank"
            rel="noreferrer"
          >
            @IdentityMaxis
          </a>{" "}
          on X to be part of history.
        </p>
        <a
          className="font-semibold text-sm flex items-center hover:text-teal-900 block mb-[20px] text-primaryButtonColor"
          target="_blank"
          href="/sns"
        >
          Read more
          <Icon className="ms-1 h-[14px]" />
        </a>
        <Button className="w-full mt-auto" onClick={onSubmit}>
          Continue to app
        </Button>
      </div>
    </div>
  )
}
