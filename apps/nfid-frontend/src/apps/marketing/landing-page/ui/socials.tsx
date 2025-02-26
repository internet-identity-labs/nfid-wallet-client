import clsx from "clsx"

import Discord from "../assets/new-landing/ds.svg"
import Github from "../assets/new-landing/gh.svg"
import LinkedIn from "../assets/new-landing/ln.svg"
import OpenChat from "../assets/new-landing/open-chat.svg"
import Twitter from "../assets/new-landing/x.svg"

export function Socials({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-x-[20px] md:gap-x-5 justify-center",
        className,
      )}
    >
      <a
        href="https://twitter.com/@IdentityMaxis"
        target="_blank"
        rel="noreferrer"
        className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#8B9BA6] transition-all active:bg-[#8B9BA6] active:opacity-70"
      >
        <img className="w-[24px] h-[24px]" src={Twitter} alt="" />
      </a>
      <a
        href="https://github.com/internet-identity-labs"
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
        className="rounded-[12px] bg-white w-[48px] h-[48px] flex items-center justify-center hover:bg-[#BE217D] transition-all active:bg-[#9D226E] active:opacity-70"
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
  )
}
