import { Container } from "./container"
import { Socials } from "./socials"

export function Footer() {
  return (
    <Container>
      <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center lg:justify-between gap-x-5 gap-y-4 pb-[25px] md:pb-[30px] text-white">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <a
            href="https://identitykit.xyz/docs/legal/terms"
            target="_blank"
            rel="noreferrer"
            className="mr-[30px] leading-[30px] inline-block hover:text-teal-400 transition-all"
          >
            Terms of service
          </a>
          <a
            href="https://identitykit.xyz/docs/legal/privacy"
            target="_blank"
            rel="noreferrer"
            className="leading-[30px] inline-block hover:text-teal-400 transition-all"
          >
            Privacy policy
          </a>
          <p className="leading-[30px] text-zinc-500 mt-[8px]">
            Copyright {new Date().getFullYear()}. Internet Identity Labs, Inc.
            All Rights Reserved.
          </p>
        </div>
        <Socials className="order-1" />
      </div>
    </Container>
  )
}
