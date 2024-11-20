import Discord from "../assets/new-landing/ds.svg"
import Github from "../assets/new-landing/gh.svg"
import LinkedIn from "../assets/new-landing/ln.svg"
import OpenChat from "../assets/new-landing/open-chat.svg"
import Twitter from "../assets/new-landing/x.svg"
import { Container } from "./container"

export function Footer() {
  return (
    <Container>
      <div className="flex flex-wrap items-center justify-center md:justify-between gap-x-5 gap-y-4 mt-[80px] md:mt-[160px] pb-[25px] md:pb-[30px] text-white">
        <div className="order-2 text-center md:order-1 md:text-left">
          <a
            href="https://docs.nfid.one/legal/terms"
            target="_blank"
            rel="noreferrer"
            className="mr-[30px] leading-[30px] inline-block hover:text-[#2DEECB] transition-all"
          >
            Terms of service
          </a>
          <a
            href="https://docs.nfid.one/legal/privacy"
            target="_blank"
            rel="noreferrer"
            className="leading-[30px] inline-block hover:text-[#2DEECB] transition-all"
          >
            Privacy policy
          </a>
          <p className="leading-[30px] text-[#71717A] mt-[8px]">
            Copyright {new Date().getFullYear()}. Internet Identity Labs, Inc.
            All Rights Reserved.
          </p>
        </div>
        <div className="flex items-center gap-x-[20px] md:gap-x-5 justify-center order-1">
          <a
            href="https://twitter.com/@IdentityMaxis"
            target="_blank"
            rel="noreferrer"
            className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#8B9BA6] transition-all active:bg-[#8B9BA6] active:opacity-70"
          >
            <img className="w-[24px] h-[24px]" src={Twitter} alt="" />
          </a>
          <a
            href="https://github.com/dostro/nfid-docs"
            target="_blank"
            rel="noreferrer"
            className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#AA8353] transition-all active:bg-[#AA8353] active:opacity-70"
          >
            <img className="w-[24px] h-[24px]" src={Github} alt="" />
          </a>
          <a
            href="https://oc.app/community/66hym-7iaaa-aaaaf-bm7aa-cai/channel/1241143482/?ref=prkg5-paaaa-aaaaf-aqbia-cai"
            target="_blank"
            rel="noreferrer"
            className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#8B9BA6] transition-all active:bg-[#8B9BA6] active:opacity-70"
          >
            <img className="w-[24px] h-[24px]" src={OpenChat} alt="" />
          </a>
          <a
            href="https://discord.gg/a9BFNrYJ99"
            target="_blank"
            rel="noreferrer"
            className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#5C6CFF] transition-all active:bg-[#5C6CFF] active:opacity-70"
          >
            <img className="w-[24px] h-[24px]" src={Discord} alt="" />
          </a>
          <a
            href="https://linkedin.com/company/nfid-labs"
            target="_blank"
            rel="noreferrer"
            className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#37A5F0] transition-all active:bg-[#37A5F0] active:opacity-70"
          >
            <img className="w-[24px] h-[24px]" src={LinkedIn} alt="" />
          </a>
        </div>
      </div>
    </Container>
  )
}
