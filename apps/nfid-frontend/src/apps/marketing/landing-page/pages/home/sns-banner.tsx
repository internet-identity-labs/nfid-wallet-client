import { Link } from "react-router-dom"

import coinsImg from "../../assets/modal-coins.png"
import { LinkIcon } from "./link-icon"

export function SnsBanner() {
  return (
    <div
      style={{
        backgroundImage: window.screen.width > 767 ? `url(${coinsImg})` : "",
        backgroundSize: window.screen.width > 900 ? "55% 100%" : "65% 100%",
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat",
      }}
      className="px-[20px] sm:px-[50px] lg:px-[70px] py-[25px] sm:py-[50px] lg:py-[70px] !bg-[#043E35] rounded-[24px]"
    >
      <div className="w-full md:w-[60%] lg:w-[65%] xl:w-[500px]">
        <h2 className="font-bold text-[18px] lg:text-[32px] leading-[140%] text-white mb-[25px]">
          Take a stake in Web3’s fattest wallet with the $NFIDW token
        </h2>
        <h3 className="text-white mb-[25px] text-[16px]">
          <span className="block mb-[15px]">
            NFID Wallet DAO is on a mission to make Web3 accessible to everyone
            by championing ICP as the entry-point and NFID Wallet as the
            gateway.
          </span>
          Own part of the only community-owned gateway to Web3 with the $NFIDW
          token.
        </h3>
      </div>
      <Link
        to="/sns"
        className="text-teal-300 hover:text-teal-500 flex items-center"
      >
        How to participate <LinkIcon className="ms-1" />
      </Link>
    </div>
  )
}
